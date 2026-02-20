import React, { useState, useRef, useEffect, useContext } from 'react';
import { Role } from '../../types';
import { CameraIcon, PencilAltIcon } from './Icons';
import { AppContext } from '../../contexts/AppContext';

import { Mail, Calendar, ShieldCheck, Key, ChevronRight, User as UserIconLucide } from 'lucide-react';

const Profile: React.FC = () => {
    const { currentUser, updateUser } = useContext(AppContext);

    const [name, setName] = useState(currentUser?.name || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (currentUser) { setName(currentUser.name); } }, [currentUser]);

    if (!currentUser) return <div className="text-center p-8 text-brand-text/60">Please log in to view your profile.</div>;

    const handleNameSave = () => {
        if (name.trim()) {
            updateUser({ ...currentUser, name: name.trim() });
            setIsEditingName(false);
        }
    };
    const handleProfilePictureClick = () => fileInputRef.current?.click();
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && currentUser) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`http://localhost:8087/api/users/${currentUser.id}/profile-picture/upload`, {
                    method: 'POST',
                    body: formData, // No Content-Type header needed, fetch adds multipart boundary automatically
                });

                if (response.ok) {
                    const updatedUser = await response.json();
                    updateUser(updatedUser);
                    // Force refresh key if needed, or rely on currentUser change
                } else {
                    console.error('Failed to upload profile picture');
                }
            } catch (error) {
                console.error('Error uploading profile picture:', error);
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-brand-text font-display tracking-tight">Profile Settings</h2>
                <div className="px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-widest">
                    {currentUser.role} Account
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Personal Info & Avatar */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="relative group bg-brand-card/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-primary/10 blur-[100px] rounded-full" />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="relative">
                                <div className="p-1 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary shadow-2xl shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-500">
                                    <div className="p-1 rounded-full bg-[#0C1B2A]">
                                        <img
                                            src={
                                                !currentUser.profilePicture
                                                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`
                                                    : (currentUser.profilePicture.startsWith('http') || currentUser.profilePicture.startsWith('data:'))
                                                        ? currentUser.profilePicture
                                                        : `http://localhost:8087/uploads/${currentUser.profilePicture}`
                                            }
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-white/5"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleProfilePictureClick}
                                    className="absolute bottom-1 right-1 bg-brand-primary text-[#0C1B2A] hover:bg-brand-secondary p-2.5 rounded-full transition-all transform hover:scale-110 shadow-xl border-4 border-[#0C1B2A]"
                                    title="Change Profile Picture"
                                >
                                    <CameraIcon className="w-5 h-5" />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>

                            <div className="space-y-2 w-full px-4">
                                {isEditingName ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                                            className="text-2xl font-black text-center bg-white/5 border-b-2 border-brand-primary focus:outline-none text-brand-text px-4 py-1 rounded-t-lg w-full max-w-[200px]"
                                            autoFocus
                                        />
                                        <div className="flex gap-1">
                                            <button onClick={handleNameSave} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">Save</button>
                                            <button onClick={() => { setIsEditingName(false); setName(currentUser.name) }} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <h3 className="text-3xl font-black text-brand-text font-display tracking-tight">{name}</h3>
                                        <button
                                            onClick={() => setIsEditingName(true)}
                                            className="p-1.5 text-brand-text/40 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                        >
                                            <PencilAltIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <p className="text-brand-text/40 font-medium uppercase tracking-[0.2em] text-[10px]">{currentUser.role} ID: {currentUser.id.slice(0, 8)}</p>
                            </div>

                            <div className="w-full pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group/info hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover/info:scale-110 transition-transform">
                                            <Mail size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-brand-text/50">Email Address</p>
                                            <p className="text-sm font-bold text-brand-text">{currentUser.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group/info hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary group-hover/info:scale-110 transition-transform">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-brand-text/50">Member Since</p>
                                            <p className="text-sm font-bold text-brand-text">
                                                {currentUser.createdAt
                                                    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                                    : 'Early 2024'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Security & Privacy */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-brand-card/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-brand-text font-display">Security Settings</h3>
                                <p className="text-sm text-brand-text/50">Manage your password and account protection</p>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const currentPassword = formData.get('currentPassword') as string;
                            const newPassword = formData.get('newPassword') as string;
                            const confirmPassword = formData.get('confirmPassword') as string;

                            if (!currentPassword || !newPassword || !confirmPassword) {
                                alert('Please fill in all fields');
                                return;
                            }

                            if (newPassword !== confirmPassword) {
                                alert('Passwords do not match');
                                return;
                            }

                            try {
                                const response = await fetch(`http://localhost:8087/api/users/${currentUser.id}/change-password`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ currentPassword, newPassword })
                                });

                                const result = await response.json();
                                if (response.ok) {
                                    alert('Password changed successfully');
                                    (e.target as HTMLFormElement).reset();
                                } else {
                                    alert(result.error || 'Failed to change password');
                                }
                            } catch (error) {
                                console.error('Error changing password:', error);
                                alert('Connection error. Please try again.');
                            }
                        }}>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-brand-text/60 ml-1">Current Password</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-text/40 group-focus-within/input:text-brand-primary transition-colors">
                                            <Key size={18} />
                                        </div>
                                        <input
                                            name="currentPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary focus:bg-white/15 transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-brand-text/60 ml-1">New Password</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-text/40 group-focus-within/input:text-brand-primary transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <input
                                                name="newPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary focus:bg-white/15 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-brand-text/60 ml-1">Confirm New Password</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-text/40 group-focus-within/input:text-brand-primary transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <input
                                                name="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary focus:bg-white/15 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="group flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-[#0C1B2A] font-black py-4 px-10 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20"
                                >
                                    Update Password
                                    <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;