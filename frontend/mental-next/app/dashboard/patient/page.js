"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PatientDashboard from '@/components/PatientDashboard';

export default function Page() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    if (!user) return null;

    return <PatientDashboard
        userId={user.id}
        onLogout={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }}
    />;
}
