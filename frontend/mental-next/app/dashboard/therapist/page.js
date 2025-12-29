"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TherapistDashboard from '@/components/TherapistDashboard';

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
        if (!user.id.toUpperCase().startsWith('T')) {
            router.push('/login');
            return;
        }
        setAuthorized(true);
    }, [router]);

    if (!authorized) return null;

    return <TherapistDashboard
        onBack={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }}
    />;
}
