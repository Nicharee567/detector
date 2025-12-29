"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PsychiatristDashboard from '@/components/PsychiatristDashboard';

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
        if (!user.id.toUpperCase().startsWith('DR')) {
            router.push('/login'); // Or unauthorized page
            return;
        }
        setAuthorized(true);
    }, [router]);

    if (!authorized) return null;

    return <PsychiatristDashboard
        onBack={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }}
    />;
}
