import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import MaterialIcon from '../../../Components/MaterialIcon';

export default function UsersIndex({ users = {}, filters = {}, summary = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);

  // Forms
  const createForm = useForm({
    name: '',
    email: '',
    phone_number: '',
    role: 'pengguna',
    password: '',
    is_active: true,
  });

  const editForm = useForm({
    name: '',
    email: '',
    phone_number: '',
    role: 'pengguna',
    is_active: true,
  });

  const resetPasswordForm = useForm({
    new_password: '',
  });

  const handleFilter = (newSearch, newRole, newStatus) => {
    router.get(
      '/admin/users',
      {
        search: newSearch !== undefined ? newSearch : search,
        role: newRole !== undefined ? newRole : roleFilter,
        status: newStatus !== undefined ? newStatus : statusFilter,
      },
      { preserveState: true, replace: true }
    );
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    editForm.setData({
      name: u.name,
      email: u.email,
      phone_number: u.phone_number,
      role: u.role,
      is_active: u.is_active,
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createForm.post('/admin/users', {
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
      },
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    editForm.put(`/admin/users/${editingUser.id}`, {
      onSuccess: () => {
        setEditingUser(null);
      },
    });
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resettingUser) return;
    resetPasswordForm.post(`/admin/users/${resettingUser.id}/reset-password`, {
      onSuccess: () => {
        setResettingUser(null);
        resetPasswordForm.reset();
      },
    });
  };

  const handleToggleActive = (u) => {
    if (confirm(`Yakin ingin ${u.is_active ? 'menonaktifkan' : 'mengaktifkan'} akun ${u.name}?`)) {
      router.patch(`/admin/users/${u.id}/toggle`);
    }
  };

  const handleDeleteUser = (u) => {
    if (confirm(`PERINGATAN: Hapus permanen pengguna ${u.name} dan seluruh data keuangannya?`)) {
      router.delete(`/admin/users/${u.id}`);
    }
  };

  return (
    <AdminLayout title="Manajemen Pengguna & Role">
      <Head title="Manajemen Pengguna - VIRA Admin" />

      {/* =========================================================================
          1. SUMMARY BADGES
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border-3 border-[#1C1A27] p-3.5 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#454654] font-black uppercase block">TOTAL USER</span>
          <span className="font-headline-md text-2xl font-black text-[#1C1A27]">{summary.total || 0}</span>
        </div>
        <div className="bg-[#FFDAD6] border-3 border-[#1C1A27] p-3.5 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#93000A] font-black uppercase block">SUPER ADMIN</span>
          <span className="font-headline-md text-2xl font-black text-[#93000A]">{summary.admins || 0}</span>
        </div>
        <div className="bg-[#FEF08A] border-3 border-[#1C1A27] p-3.5 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#854D0E] font-black uppercase block">PENGGUNA BIASA</span>
          <span className="font-headline-md text-2xl font-black text-[#854D0E]">{summary.pengguna || 0}</span>
        </div>
        <div className="bg-[#DCFCE7] border-3 border-[#1C1A27] p-3.5 shadow-[3px_3px_0px_0px_#1C1A27]">
          <span className="font-label-mono text-[10px] text-[#166534] font-black uppercase block">AKUN AKTIF</span>
          <span className="font-headline-md text-2xl font-black text-[#166534]">{summary.active || 0}</span>
        </div>
      </div>

      {/* =========================================================================
          2. ACTION BAR & FILTERS
          ========================================================================= */}
      <div className="bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] p-4 sm:p-5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFilter(search, roleFilter, statusFilter);
              }}
              placeholder="Cari nama, email, atau nomor HP..."
              className="flex-1 border-3 border-[#1C1A27] px-3 py-2 font-body-md text-xs sm:text-sm font-bold focus:outline-none shadow-[2px_2px_0px_0px_#1C1A27]"
            />
            <button
              type="button"
              onClick={() => handleFilter(search, roleFilter, statusFilter)}
              className="bg-[#3B4CCA] text-white border-3 border-[#1C1A27] px-4 py-2 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-[#2A379D] cursor-pointer"
            >
              Cari
            </button>
          </div>

          {/* Role & Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                handleFilter(search, e.target.value, statusFilter);
              }}
              className="border-3 border-[#1C1A27] px-2.5 py-2 font-label-mono text-xs uppercase font-bold bg-white shadow-[2px_2px_0px_0px_#1C1A27] cursor-pointer"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="pengguna">Pengguna</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilter(search, roleFilter, e.target.value);
              }}
              className="border-3 border-[#1C1A27] px-2.5 py-2 font-label-mono text-xs uppercase font-bold bg-white shadow-[2px_2px_0px_0px_#1C1A27] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="bg-[#FEF08A] hover:bg-[#FACC15] text-[#1C1A27] border-3 border-[#1C1A27] px-4 py-2 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 ml-auto"
            >
              <MaterialIcon name="person_add" className="text-base" />
              <span>+ Tambah Pengguna</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. USERS DATA TABLE
          ========================================================================= */}
      <div className="bg-white border-4 border-[#1C1A27] shadow-[5px_5px_0px_0px_#1C1A27] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md text-xs sm:text-sm">
            <thead>
              <tr className="border-b-4 border-[#1C1A27] bg-[#FDF8FF] font-label-mono text-xs uppercase font-black text-[#1C1A27]">
                <th className="p-3 sm:p-4">Pengguna</th>
                <th className="p-3 sm:p-4">Role</th>
                <th className="p-3 sm:p-4">Kontak</th>
                <th className="p-3 sm:p-4 text-center">Data</th>
                <th className="p-3 sm:p-4 text-center">Status</th>
                <th className="p-3 sm:p-4">Terdaftar</th>
                <th className="p-3 sm:p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1C1A27]">
              {users.data && users.data.length > 0 ? (
                users.data.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F1EBFE] transition-colors">
                    {/* User Info */}
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url}
                          alt={u.name}
                          className="w-9 h-9 rounded-full border-2 border-[#1C1A27] bg-white shrink-0 shadow-[1px_1px_0px_0px_#1C1A27]"
                        />
                        <div className="min-w-0">
                          <span className="font-headline-md font-black text-[#1C1A27] block truncate">
                            {u.name} {u.is_self && <span className="text-[#8B5CF6] text-xs">(Anda)</span>}
                          </span>
                          <span className="font-label-mono text-[11px] text-[#454654] block truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="p-3 sm:p-4 font-label-mono">
                      <span
                        className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 border-2 border-[#1C1A27] shadow-[1px_1px_0px_0px_#1C1A27] ${
                          u.role === 'admin'
                            ? 'bg-[#EF4444] text-white'
                            : 'bg-[#FEF08A] text-[#1C1A27]'
                        }`}
                      >
                        {u.role === 'admin' ? '👑 SUPER ADMIN' : '👤 PENGGUNA'}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="p-3 sm:p-4 font-label-mono text-xs font-bold text-[#454654]">
                      <div>{u.phone_number}</div>
                      {u.is_google_linked && (
                        <span className="text-[9px] bg-[#DCFCE7] text-[#166534] border border-[#1C1A27] px-1 font-black">
                          Google Linked
                        </span>
                      )}
                    </td>

                    {/* Counts */}
                    <td className="p-3 sm:p-4 text-center font-label-mono text-xs font-bold">
                      <span className="bg-[#F1EBFE] border border-[#1C1A27] px-1.5 py-0.5">
                        {u.wallets_count} Dompet • {u.transactions_count} Trx
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-3 sm:p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(u)}
                        disabled={u.is_self}
                        className={`px-2 py-0.5 font-label-mono text-[10px] uppercase font-black border-2 border-[#1C1A27] cursor-pointer shadow-[1px_1px_0px_0px_#1C1A27] ${
                          u.is_active
                            ? 'bg-[#DCFCE7] text-[#166534] hover:bg-[#bbf7d0]'
                            : 'bg-[#FFDAD6] text-[#93000A] hover:bg-[#fecaca]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Klik untuk ubah status"
                      >
                        {u.is_active ? '✓ AKTIF' : '✕ NONAKTIF'}
                      </button>
                    </td>

                    {/* Registered Date */}
                    <td className="p-3 sm:p-4 font-label-mono text-xs text-[#454654]">
                      {u.created_at}
                    </td>

                    {/* Actions */}
                    <td className="p-3 sm:p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="w-8 h-8 bg-white hover:bg-[#FEF08A] border-2 border-[#1C1A27] shadow-[1px_1px_0px_0px_#1C1A27] flex items-center justify-center cursor-pointer"
                          title="Edit User & Role"
                        >
                          <MaterialIcon name="edit" className="text-sm text-[#1C1A27]" />
                        </button>

                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => setResettingUser(u)}
                          className="w-8 h-8 bg-white hover:bg-[#E7DEFF] border-2 border-[#1C1A27] shadow-[1px_1px_0px_0px_#1C1A27] flex items-center justify-center cursor-pointer"
                          title="Reset Password"
                        >
                          <MaterialIcon name="lock_reset" className="text-sm text-[#3B4CCA]" />
                        </button>

                        {/* Delete Button */}
                        {!u.is_self && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="w-8 h-8 bg-white hover:bg-[#FFDAD6] border-2 border-[#1C1A27] shadow-[1px_1px_0px_0px_#1C1A27] flex items-center justify-center cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <MaterialIcon name="delete" className="text-sm text-[#DC2626]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#454654] font-label-mono font-bold">
                    Tidak ada data pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users.links && users.links.length > 3 && (
          <div className="p-4 border-t-3 border-[#1C1A27] flex flex-wrap items-center justify-between gap-2 bg-[#FDF8FF]">
            <span className="font-label-mono text-xs font-bold text-[#454654]">
              Menampilkan {users.from || 0} - {users.to || 0} dari {users.total || 0} Pengguna
            </span>
            <div className="flex gap-1">
              {users.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url || '#'}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-2.5 py-1 font-label-mono text-xs uppercase font-black border-2 border-[#1C1A27] ${
                    link.active
                      ? 'bg-[#3B4CCA] text-white shadow-[2px_2px_0px_0px_#1C1A27]'
                      : 'bg-white text-[#1C1A27] hover:bg-[#FEF08A]'
                  } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. MODAL TAMBAH PENGGUNA BARU
          ========================================================================= */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1A27]/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white border-4 border-[#1C1A27] shadow-[6px_6px_0px_0px_#1C1A27] p-6 w-full max-w-md my-auto space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-3 border-[#1C1A27] pb-3">
              <h3 className="font-headline-md font-black text-lg text-[#1C1A27] uppercase">
                TAMBAH PENGGUNA BARU
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 font-body-md">
              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={createForm.data.name}
                  onChange={(e) => createForm.setData('name', e.target.value)}
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Email Akun *
                </label>
                <input
                  type="email"
                  value={createForm.data.email}
                  onChange={(e) => createForm.setData('email', e.target.value)}
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Nomor HP / WhatsApp *
                </label>
                <input
                  type="text"
                  value={createForm.data.phone_number}
                  onChange={(e) => createForm.setData('phone_number', e.target.value)}
                  placeholder="081234567890"
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Role Pengguna *
                </label>
                <select
                  value={createForm.data.role}
                  onChange={(e) => createForm.setData('role', e.target.value)}
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-black uppercase bg-white shadow-[2px_2px_0px_0px_#1C1A27]"
                >
                  <option value="pengguna">👤 Pengguna Biasa</option>
                  <option value="admin">👑 Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Password Awal *
                </label>
                <input
                  type="password"
                  value={createForm.data.password}
                  onChange={(e) => createForm.setData('password', e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white border-3 border-[#1C1A27] py-2.5 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createForm.processing}
                  className="flex-1 bg-[#4ADE80] text-[#14532D] border-3 border-[#1C1A27] py-2.5 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-[#22C55E]"
                >
                  {createForm.processing ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. MODAL EDIT PENGGUNA & ROLE
          ========================================================================= */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1A27]/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="bg-white border-4 border-[#1C1A27] shadow-[6px_6px_0px_0px_#1C1A27] p-6 w-full max-w-md my-auto space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-3 border-[#1C1A27] pb-3">
              <h3 className="font-headline-md font-black text-lg text-[#1C1A27] uppercase">
                EDIT DATA PENGGUNA
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 font-body-md">
              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={editForm.data.name}
                  onChange={(e) => editForm.setData('name', e.target.value)}
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Email Akun *
                </label>
                <input
                  type="email"
                  value={editForm.data.email}
                  onChange={(e) => editForm.setData('email', e.target.value)}
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Nomor HP / WhatsApp *
                </label>
                <input
                  type="text"
                  value={editForm.data.phone_number}
                  onChange={(e) => editForm.setData('phone_number', e.target.value)}
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                />
              </div>

              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Role Pengguna *
                </label>
                <select
                  value={editForm.data.role}
                  onChange={(e) => editForm.setData('role', e.target.value)}
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-black uppercase bg-white shadow-[2px_2px_0px_0px_#1C1A27]"
                >
                  <option value="pengguna">👤 Pengguna Biasa</option>
                  <option value="admin">👑 Super Administrator</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-white border-3 border-[#1C1A27] py-2.5 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editForm.processing}
                  className="flex-1 bg-[#4ADE80] text-[#14532D] border-3 border-[#1C1A27] py-2.5 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-[#22C55E]"
                >
                  {editForm.processing ? 'Menyimpan...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL RESET PASSWORD
          ========================================================================= */}
      {resettingUser && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1A27]/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setResettingUser(null)}
        >
          <div
            className="bg-white border-4 border-[#1C1A27] shadow-[6px_6px_0px_0px_#1C1A27] p-6 w-full max-w-md my-auto space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-3 border-[#1C1A27] pb-3">
              <h3 className="font-headline-md font-black text-lg text-[#1C1A27] uppercase">
                RESET PASSWORD USER
              </h3>
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-body-md text-[#454654] font-bold">
              Masukkan password baru untuk pengguna: <span className="text-[#1C1A27] font-black">{resettingUser.name}</span> ({resettingUser.email}).
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 font-body-md">
              <div>
                <label className="block font-label-mono text-xs uppercase font-black text-[#1C1A27] mb-1">
                  Password Baru *
                </label>
                <input
                  type="password"
                  value={resetPasswordForm.data.new_password}
                  onChange={(e) => resetPasswordForm.setData('new_password', e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full border-3 border-[#1C1A27] p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="flex-1 bg-white border-3 border-[#1C1A27] py-2.5 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordForm.processing}
                  className="flex-1 bg-[#3B4CCA] text-white border-3 border-[#1C1A27] py-2.5 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-[#2A379D]"
                >
                  {resetPasswordForm.processing ? 'Menyimpan...' : 'Ganti Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

