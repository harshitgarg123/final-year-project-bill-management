import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  X, Loader2, User, Mail, Phone, MapPin, Calendar, Building2,
  Briefcase, Globe, FileText, Shield, Clock
} from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_image: string | null;
  status: string;
  created_at: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  company_name?: string;
  department?: string;
  designation?: string;
  bio?: string;
}

interface UserDetailModalProps {
  userId: number;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, onClose }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/users/details/${userId}`);
      setUser(response.data);
    } catch {
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'MANAGER': return 'bg-purple-100 text-purple-700 ring-purple-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-700 ring-blue-200';
      case 'CLIENT': return 'bg-green-100 text-green-700 ring-green-200';
      default: return 'bg-gray-100 text-gray-700 ring-gray-200';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const fullAddress = user
    ? [user.address_line1, user.address_line2, user.city, user.state, user.zip_code, user.country]
        .filter(Boolean)
        .join(', ')
    : '';

  const hasPersonalInfo = user && (user.phone || user.date_of_birth || user.gender || user.bio);
  const hasAddress = user && (user.address_line1 || user.city || user.state || user.country);
  const hasProfessional = user && (user.company_name || user.department || user.designation);
  const hasAdditionalInfo = hasPersonalInfo || hasAddress || hasProfessional;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <button onClick={onClose} className="mt-4 text-indigo-600 hover:underline">Close</button>
          </div>
        ) : user ? (
          <>
            {/* Header with user avatar */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-t-2xl px-6 py-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-5">
                {user.profile_image ? (
                  <img
                    src={`http://localhost:5000/uploads/${user.profile_image}`}
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-indigo-200">
                    <Mail size={14} />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ring-1 ${getRoleBadge(user.role)}`}>
                      <Shield size={12} />
                      {user.role}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Account Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={14} /> Account Info
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">User ID:</span>
                      <span className="ml-2 font-medium text-gray-900">#{user.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Joined:</span>
                      <span className="ml-2 font-medium text-gray-900">{formatDate(user.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {!hasAdditionalInfo && (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No additional information provided</p>
                  <p className="text-gray-400 text-sm mt-1">This user hasn't added their details yet</p>
                </div>
              )}

              {/* Personal Info */}
              {hasPersonalInfo && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User size={14} /> Personal Details
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {user.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={15} className="text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-28 shrink-0">Phone:</span>
                        <span className="font-medium text-gray-900">{user.phone}</span>
                      </div>
                    )}
                    {user.date_of_birth && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar size={15} className="text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-28 shrink-0">Date of Birth:</span>
                        <span className="font-medium text-gray-900">{formatDate(user.date_of_birth)}</span>
                      </div>
                    )}
                    {user.gender && (
                      <div className="flex items-center gap-3 text-sm">
                        <User size={15} className="text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-28 shrink-0">Gender:</span>
                        <span className="font-medium text-gray-900 capitalize">{user.gender.toLowerCase()}</span>
                      </div>
                    )}
                    {user.bio && (
                      <div className="flex items-start gap-3 text-sm pt-1">
                        <FileText size={15} className="text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-gray-500 w-28 shrink-0">Bio:</span>
                        <span className="text-gray-700 leading-relaxed">{user.bio}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Address */}
              {hasAddress && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin size={14} /> Address
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-gray-900 leading-relaxed">{fullAddress || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional */}
              {hasProfessional && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Briefcase size={14} /> Professional Info
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {user.company_name && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 size={15} className="text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-28 shrink-0">Company:</span>
                        <span className="font-medium text-gray-900">{user.company_name}</span>
                      </div>
                    )}
                    {user.department && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe size={15} className="text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-28 shrink-0">Department:</span>
                        <span className="font-medium text-gray-900">{user.department}</span>
                      </div>
                    )}
                    {user.designation && (
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase size={15} className="text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-28 shrink-0">Designation:</span>
                        <span className="font-medium text-gray-900">{user.designation}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
