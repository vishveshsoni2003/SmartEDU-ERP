import React, { useState, useEffect, useCallback } from 'react';
import {
  Bus, Users, UserCheck, Unlink, RefreshCw,
  UserPlus, Trash2, Phone, Award
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import CreateRoute from '../../components/admin/CreateRoute';
import ManageRoutes from '../../components/admin/ManageRoutes';
import CreateBus from '../../components/admin/CreateBus';
import ManageBuses from '../../components/admin/ManageBuses';
import toast from 'react-hot-toast';
import {
  getAllDrivers,
  getAllBuses,
  createDriver,
  deleteDriver,
  assignBusToDriver,
  unassignBusFromDriver
} from '../../services/adminApi';

const TAB_CLS = (active) =>
  `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
    active
      ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
  }`;

const inputCls =
  'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 ' +
  'text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none ' +
  'focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-colors';

const labelCls = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

/* ─────────────────────────────────────
   Drivers Panel — create, assign, list
───────────────────────────────────── */
function DriversPanel({ refreshKey: externalKey }) {
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [form, setForm] = useState({
    name: '', email: '', password: '123456', phone: '', licenseNumber: ''
  });
  const [creating, setCreating] = useState(false);

  // Assignment
  const [assignForm, setAssignForm] = useState({ driverId: '', busId: '' });
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, b] = await Promise.all([getAllDrivers(), getAllBuses()]);
      setDrivers(d.drivers || []);
      setBuses(b.buses || []);
    } catch {
      toast.error('Failed to load driver data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, externalKey]);

  // ── Create ──────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    const { name, email, password, phone, licenseNumber } = form;
    if (!name || !email || !password || !phone || !licenseNumber) {
      return toast.error('All fields are required');
    }
    setCreating(true);
    try {
      await createDriver(form);
      toast.success('Driver account created successfully');
      setForm({ name: '', email: '', password: '123456', phone: '', licenseNumber: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create driver');
    } finally {
      setCreating(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const handleDelete = (driver) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-slate-900 dark:text-white">Remove {driver.name}?</p>
        <p className="text-sm text-slate-500">
          This permanently deletes their driver profile and login access.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setDeleting(driver._id);
              try {
                await deleteDriver(driver._id);
                setDrivers(prev => prev.filter(d => d._id !== driver._id));
                toast.success('Driver removed');
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to remove driver');
              } finally {
                setDeleting(null);
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-600/20"
          >
            Remove
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  // ── Assign ──────────────────────────────────────
  const handleAssign = async () => {
    if (!assignForm.driverId || !assignForm.busId) {
      return toast.error('Select both a driver and a bus');
    }
    setAssigning(true);
    try {
      await assignBusToDriver({ driverId: assignForm.driverId, busId: assignForm.busId });
      toast.success('Bus assigned to driver');
      setAssignForm({ driverId: '', busId: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  // ── Unassign ────────────────────────────────────
  const handleUnassign = async (driverId) => {
    setUnassigning(driverId);
    try {
      await unassignBusFromDriver(driverId);
      toast.success('Bus unassigned');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unassign failed');
    } finally {
      setUnassigning(null);
    }
  };

  const unassignedDrivers = drivers.filter(d => !d.assignedBusId);
  const unassignedBuses   = buses.filter(b => !b.driverId);

  return (
    <div className="space-y-8">

      {/* ── Section 1: Create Driver ── */}
      <div>
        <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <UserPlus className="h-3.5 w-3.5" /> Register New Driver
        </h4>
        <form
          onSubmit={handleCreate}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Ramesh Kumar"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="driver@institution.edu"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. 9876543210"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>License Number</label>
              <input
                value={form.licenseNumber}
                onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                placeholder="e.g. DL-1234567890"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Default: 123456"
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              {creating
                ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <UserPlus className="h-4 w-4" />
              }
              {creating ? 'Creating...' : 'Create Driver'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Assign Driver → Bus ── */}
      {drivers.length > 0 && (
        <div>
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5" /> Assign Driver to Bus
          </h4>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            {unassignedDrivers.length === 0 && unassignedBuses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                All drivers are already assigned to buses.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <select
                    className={inputCls}
                    value={assignForm.driverId}
                    onChange={e => setAssignForm(f => ({ ...f, driverId: e.target.value }))}
                  >
                    <option value="">Select unassigned driver</option>
                    {unassignedDrivers.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.name || d.userId?.name} — {d.licenseNumber}
                      </option>
                    ))}
                  </select>
                  <select
                    className={inputCls}
                    value={assignForm.busId}
                    onChange={e => setAssignForm(f => ({ ...f, busId: e.target.value }))}
                  >
                    <option value="">Select unassigned bus</option>
                    {unassignedBuses.map(b => (
                      <option key={b._id} value={b._id}>
                        Bus {b.busNumber}{b.routeId ? ` — ${b.routeId.routeName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAssign}
                  disabled={assigning || !assignForm.driverId || !assignForm.busId}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
                >
                  {assigning
                    ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <UserCheck className="h-4 w-4" />
                  }
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Section 3: Driver Roster ── */}
      <div>
        <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Users className="h-3.5 w-3.5" /> Driver Roster
          <span className="ml-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">
            {drivers.length}
          </span>
        </h4>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Users className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-semibold text-slate-500 dark:text-slate-400">No drivers registered yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Use the form above to register your first driver.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {drivers.map(d => {
              const assignedBus = d.assignedBusId;
              return (
                <div
                  key={d._id}
                  className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                >
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(d.name || d.userId?.name || 'D').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {d.name || d.userId?.name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {d.phone && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {d.phone}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                          <Award className="h-3 w-3" /> {d.licenseNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {assignedBus ? (
                      <>
                        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-1">
                          <Bus className="h-3 w-3" />
                          Bus {assignedBus.busNumber || assignedBus}
                        </span>
                        <button
                          onClick={() => handleUnassign(d._id)}
                          disabled={unassigning === d._id}
                          title="Unassign bus"
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 transition-colors disabled:opacity-50"
                        >
                          {unassigning === d._id
                            ? <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            : <Unlink className="h-4 w-4" />
                          }
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">
                        No Bus
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(d)}
                      disabled={deleting === d._id}
                      title="Remove driver"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors disabled:opacity-50"
                    >
                      {deleting === d._id
                        ? <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Main Page
───────────────────────────────────── */
export default function AdminTransport() {
  const [activeTab, setActiveTab] = useState('BUSES');
  const [listKey, setListKey] = useState(0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bus className="text-blue-600 h-9 w-9" /> Transport Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage buses, routes, and drivers.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-max border border-slate-200 dark:border-slate-800">
          <button onClick={() => setActiveTab('BUSES')} className={TAB_CLS(activeTab === 'BUSES')}>
            <Bus className="h-4 w-4" /> Buses
          </button>
          <button onClick={() => setActiveTab('ROUTES')} className={TAB_CLS(activeTab === 'ROUTES')}>
            <RefreshCw className="h-4 w-4" /> Routes
          </button>
          <button onClick={() => setActiveTab('DRIVERS')} className={TAB_CLS(activeTab === 'DRIVERS')}>
            <Users className="h-4 w-4" /> Drivers
          </button>
        </div>

        <div className="animate-in fade-in duration-200">
          {activeTab === 'BUSES' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card shadow="md" padding="lg">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Add New Bus</h3>
                <CreateBus onCreated={() => setListKey(k => k + 1)} />
              </Card>
              <Card shadow="md" padding="lg">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Fleet</h3>
                <ManageBuses key={`buses-${listKey}`} />
              </Card>
            </div>
          )}

          {activeTab === 'ROUTES' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card shadow="md" padding="lg">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Create Route</h3>
                <CreateRoute onCreated={() => setListKey(k => k + 1)} />
              </Card>
              <Card shadow="md" padding="lg">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Active Routes</h3>
                <ManageRoutes key={`routes-${listKey}`} />
              </Card>
            </div>
          )}

          {activeTab === 'DRIVERS' && (
            <Card shadow="md" padding="lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8">Drivers</h3>
              <DriversPanel refreshKey={listKey} />
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
