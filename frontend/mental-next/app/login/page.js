"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/LoginPage';

export default function Page() {
    const router = useRouter();

    const handleLogin = (user) => {
        // Redirection based on role
        if (user.id.toUpperCase().startsWith('DR')) {
            router.push('/dashboard/psychiatrist');
        } else if (user.id.toUpperCase().startsWith('T')) {
            router.push('/dashboard/therapist');
        } else if (user.id.toUpperCase().startsWith('ADMIN')) {
            router.push('/dashboard/admin');
        } else {
            router.push('/dashboard/patient');
        }
    };

    return <LoginPage
        onLogin={handleLogin}
        onSwitchToRegister={() => router.push('/register')}
    />;
}
