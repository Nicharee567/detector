"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import RegisterPage from '@/components/RegisterPage';

export default function Page() {
    const router = useRouter();

    return <RegisterPage
        onRegisterSuccess={() => router.push('/login')}
        onSwitchToLogin={() => router.push('/login')}
    />;
}
