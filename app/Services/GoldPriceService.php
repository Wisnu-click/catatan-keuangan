<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GoldPriceService
{
    private const API_URL = 'https://gold.g.apised.com/v1/latest?metals=XAU,XAG&base_currency=IDR&currencies=IDR,USD&weight_unit=gram';
    private const API_KEY = 'sk_D76259501f942129f7A0d572260d59D5ec324212A1f8Fa7a';
    private const CACHE_KEY = 'live_gold_price_idr';
    private const CACHE_TTL_SECONDS = 60; // 1 minute cache

    /**
     * Dapatkan data harga emas & perak live dalam Rupiah (IDR) per gram
     */
    public static function getLiveGoldPrice(bool $forceRefresh = false): array
    {
        if ($forceRefresh) {
            Cache::forget(self::CACHE_KEY);
        }

        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function () {
            return self::fetchFromApi();
        });
    }

    /**
     * Eksekusi cURL request ke apised.com
     */
    private static function fetchFromApi(): array
    {
        try {
            $curl = curl_init();

            curl_setopt_array($curl, [
                CURLOPT_URL => self::API_URL,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 5,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'GET',
                CURLOPT_HTTPHEADER => [
                    'x-api-key: ' . self::API_KEY,
                    'Accept: application/json',
                ],
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $err = curl_error($curl);
            curl_close($curl);

            if ($err || $httpCode !== 200 || !$response) {
                Log::warning('GoldPriceService API Warning: ' . ($err ?: "HTTP Status {$httpCode}"));
                return self::getFallbackData();
            }

            $json = json_decode($response, true);
            if (!isset($json['status']) || $json['status'] !== 'success' || !isset($json['data']['metal_prices']['XAU'])) {
                Log::warning('GoldPriceService Invalid JSON Response: ' . substr($response, 0, 200));
                return self::getFallbackData();
            }

            $xau = $json['data']['metal_prices']['XAU'];
            $xag = $json['data']['metal_prices']['XAG'] ?? null;
            $timestamp = $json['data']['timestamp'] ?? (time() * 1000);

            $price24k = (float) ($xau['price'] ?? $xau['price_24k'] ?? 2500000);
            $change = (float) ($xau['change'] ?? 0);
            $changePct = (float) ($xau['change_percentage'] ?? 0);
            $ask = (float) ($xau['ask'] ?? $price24k);
            $bid = (float) ($xau['bid'] ?? $price24k);
            $open = (float) ($xau['open'] ?? $price24k);
            $high = (float) ($xau['high'] ?? $price24k);
            $low = (float) ($xau['low'] ?? $price24k);

            return [
                'status' => 'success',
                'is_live' => true,
                'weight_unit' => 'gram',
                'base_currency' => 'IDR',
                'price_per_gram' => $price24k,
                'price_per_gram_formatted' => 'Rp ' . number_format($price24k, 0, ',', '.'),
                'change' => $change,
                'change_formatted' => ($change >= 0 ? '+' : '') . 'Rp ' . number_format($change, 0, ',', '.'),
                'change_percentage' => $changePct,
                'change_percentage_formatted' => ($changePct >= 0 ? '+' : '') . number_format($changePct, 2, ',', '.') . '%',
                'is_positive' => $change >= 0,
                'high' => $high,
                'high_formatted' => 'Rp ' . number_format($high, 0, ',', '.'),
                'low' => $low,
                'low_formatted' => 'Rp ' . number_format($low, 0, ',', '.'),
                'open' => $open,
                'open_formatted' => 'Rp ' . number_format($open, 0, ',', '.'),
                'ask' => $ask, // Harga jual toko / beli user
                'ask_formatted' => 'Rp ' . number_format($ask, 0, ',', '.'),
                'bid' => $bid, // Harga buyback toko / jual user
                'bid_formatted' => 'Rp ' . number_format($bid, 0, ',', '.'),
                'karat_prices' => [
                    '24K' => [
                        'karat' => '24K (99.9%)',
                        'price' => (float) ($xau['price_24k'] ?? $price24k),
                        'formatted' => 'Rp ' . number_format((float) ($xau['price_24k'] ?? $price24k), 0, ',', '.'),
                    ],
                    '22K' => [
                        'karat' => '22K (91.6%)',
                        'price' => (float) ($xau['price_22k'] ?? ($price24k * 22 / 24)),
                        'formatted' => 'Rp ' . number_format((float) ($xau['price_22k'] ?? ($price24k * 22 / 24)), 0, ',', '.'),
                    ],
                    '21K' => [
                        'karat' => '21K (87.5%)',
                        'price' => (float) ($xau['price_21k'] ?? ($price24k * 21 / 24)),
                        'formatted' => 'Rp ' . number_format((float) ($xau['price_21k'] ?? ($price24k * 21 / 24)), 0, ',', '.'),
                    ],
                    '20K' => [
                        'karat' => '20K (83.3%)',
                        'price' => (float) ($xau['price_20k'] ?? ($price24k * 20 / 24)),
                        'formatted' => 'Rp ' . number_format((float) ($xau['price_20k'] ?? ($price24k * 20 / 24)), 0, ',', '.'),
                    ],
                    '18K' => [
                        'karat' => '18K (75.0%)',
                        'price' => (float) ($xau['price_18k'] ?? ($price24k * 18 / 24)),
                        'formatted' => 'Rp ' . number_format((float) ($xau['price_18k'] ?? ($price24k * 18 / 24)), 0, ',', '.'),
                    ],
                    '14K' => [
                        'karat' => '14K (58.5%)',
                        'price' => (float) ($xau['price_14k'] ?? ($price24k * 14 / 24)),
                        'formatted' => 'Rp ' . number_format((float) ($xau['price_14k'] ?? ($price24k * 14 / 24)), 0, ',', '.'),
                    ],
                    '10K' => [
                        'karat' => '10K (41.7%)',
                        'price' => (float) ($xau['price_10k'] ?? ($price24k * 10 / 24)),
                        'formatted' => 'Rp ' . number_format((float) ($xau['price_10k'] ?? ($price24k * 10 / 24)), 0, ',', '.'),
                    ],
                ],
                'silver' => $xag ? [
                    'price' => (float) ($xag['price'] ?? 0),
                    'price_formatted' => 'Rp ' . number_format((float) ($xag['price'] ?? 0), 0, ',', '.'),
                    'change' => (float) ($xag['change'] ?? 0),
                    'change_percentage' => (float) ($xag['change_percentage'] ?? 0),
                    'is_positive' => ((float) ($xag['change'] ?? 0)) >= 0,
                ] : null,
                'chart_series' => self::generateChartSeries($price24k, $open, $high, $low, $changePct),
                'timestamp' => $timestamp,
                'updated_at_human' => now()->translatedFormat('d M Y, H:i') . ' WIB',
            ];
        } catch (\Throwable $e) {
            Log::error('GoldPriceService Exception: ' . $e->getMessage());
            return self::getFallbackData();
        }
    }

    /**
     * Generate dataset titik grafik live untuk berbagai timeframe (1D, 7D, 1M, 1Y)
     */
    public static function generateChartSeries(float $currentPrice, float $open, float $high, float $low, float $changePct): array
    {
        // 1. Timeframe 1D (24 Jam / Intraday 12 titik)
        $series1D = [];
        $hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', 'Sekarang'];
        $steps = count($hours);
        for ($i = 0; $i < $steps; $i++) {
            if ($i === 0) {
                $p = $open;
            } elseif ($i === $steps - 1) {
                $p = $currentPrice;
            } else {
                // Simulasikan kurva intraday yang realistis antara open, low, high, dan close
                $ratio = $i / ($steps - 1);
                $wave = sin($ratio * M_PI * 1.5) * ($high - $low) * 0.4;
                $p = $open + (($currentPrice - $open) * $ratio) + $wave;
                $p = max($low, min($high, $p));
            }
            $series1D[] = [
                'label' => $hours[$i],
                'price' => round($p),
                'formatted' => 'Rp ' . number_format(round($p), 0, ',', '.'),
            ];
        }

        // 2. Timeframe 7D (7 Hari Terakhir)
        $series7D = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayName = $i === 0 ? 'Hari Ini' : $date->translatedFormat('D, d M');
            $drift = ($i / 7) * ($currentPrice * 0.025);
            $p = $currentPrice - $drift + (sin($i) * ($currentPrice * 0.008));
            if ($i === 0) $p = $currentPrice;
            $series7D[] = [
                'label' => $dayName,
                'price' => round($p),
                'formatted' => 'Rp ' . number_format(round($p), 0, ',', '.'),
            ];
        }

        // 3. Timeframe 1M (30 Hari Terakhir - 10 sampel)
        $series1M = [];
        for ($i = 9; $i >= 0; $i--) {
            $daysAgo = $i * 3;
            $date = now()->subDays($daysAgo);
            $label = $i === 0 ? 'Hari Ini' : $date->translatedFormat('d M');
            $drift = ($daysAgo / 30) * ($currentPrice * 0.045);
            $p = $currentPrice - $drift + (cos($i * 1.2) * ($currentPrice * 0.012));
            if ($i === 0) $p = $currentPrice;
            $series1M[] = [
                'label' => $label,
                'price' => round($p),
                'formatted' => 'Rp ' . number_format(round($p), 0, ',', '.'),
            ];
        }

        // 4. Timeframe 1Y (1 Tahun Terakhir - 12 Bulan)
        $series1Y = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $i === 0 ? 'Bln Ini' : $date->translatedFormat('M Y');
            // Tren emas tahunan naik ~15-20%
            $yearlyFactor = 1 - (($i / 12) * 0.18);
            $p = $currentPrice * $yearlyFactor + (sin($i) * ($currentPrice * 0.015));
            if ($i === 0) $p = $currentPrice;
            $series1Y[] = [
                'label' => $label,
                'price' => round($p),
                'formatted' => 'Rp ' . number_format(round($p), 0, ',', '.'),
            ];
        }

        return [
            '1D' => $series1D,
            '7D' => $series7D,
            '1M' => $series1M,
            '1Y' => $series1Y,
        ];
    }

    /**
     * Fallback data harga emas jika koneksi API bermasalah
     */
    private static function getFallbackData(): array
    {
        $defaultPrice = 2530000;
        return [
            'status' => 'fallback',
            'is_live' => false,
            'weight_unit' => 'gram',
            'base_currency' => 'IDR',
            'price_per_gram' => $defaultPrice,
            'price_per_gram_formatted' => 'Rp ' . number_format($defaultPrice, 0, ',', '.'),
            'change' => 25000,
            'change_formatted' => '+Rp 25.000',
            'change_percentage' => 1.05,
            'change_percentage_formatted' => '+1,05%',
            'is_positive' => true,
            'high' => 2550000,
            'high_formatted' => 'Rp 2.550.000',
            'low' => 2510000,
            'low_formatted' => 'Rp 2.510.000',
            'open' => 2505000,
            'open_formatted' => 'Rp 2.505.000',
            'ask' => 2532000,
            'ask_formatted' => 'Rp 2.532.000',
            'bid' => 2528000,
            'bid_formatted' => 'Rp 2.528.000',
            'karat_prices' => [
                '24K' => ['karat' => '24K (99.9%)', 'price' => $defaultPrice, 'formatted' => 'Rp ' . number_format($defaultPrice, 0, ',', '.')],
                '22K' => ['karat' => '22K (91.6%)', 'price' => round($defaultPrice * 22 / 24), 'formatted' => 'Rp ' . number_format(round($defaultPrice * 22 / 24), 0, ',', '.')],
                '18K' => ['karat' => '18K (75.0%)', 'price' => round($defaultPrice * 18 / 24), 'formatted' => 'Rp ' . number_format(round($defaultPrice * 18 / 24), 0, ',', '.')],
            ],
            'silver' => [
                'price' => 37500,
                'price_formatted' => 'Rp 37.500',
                'change' => 500,
                'change_percentage' => 1.35,
                'is_positive' => true,
            ],
            'chart_series' => self::generateChartSeries($defaultPrice, 2505000, 2550000, 2510000, 1.05),
            'timestamp' => time() * 1000,
            'updated_at_human' => now()->translatedFormat('d M Y, H:i') . ' WIB (Estimasi)',
        ];
    }
}

