"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default function Page() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(storedUser);
        // Allow any user starting with ADMIN (case insensitive)
        if (!user.id.toUpperCase().startsWith('ADMIN')) {
            router.push('/login');
            return;
        }
        setAuthorized(true);
    }, [router]);

    if (!authorized) return null;

    return <Dashboard
        onLogout={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }}
    />;
}
