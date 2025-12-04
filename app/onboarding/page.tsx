'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { OTPInput } from '@/components/ui/otp-input';
import { MockService } from '@/lib/mock-service';
import { AuthService } from '@/lib/auth-service';
import { College, Branch, Year } from '@/types';

const COLLEGES: College[] = ['TIT', 'ICFAI', 'Techno', 'JIS', 'KIIT', 'VIT', 'LPU'];
const BRANCHES: Branch[] = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'AIML', 'BBA', 'MBA'];
const YEARS: Year[] = ['1st', '2nd', '3rd', '4th'];

export default function OnboardingPage() {
    const router = useRouter();
    // Steps: 0=Welcome, 1=Email, 2=OTP, 3=Academic, 4=Profile
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        college: '',
        branch: '',
        year: '',
        name: '',
        username: '',
        bio: '',
        interests: '',
    });
    const [loading, setLoading] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        // Check if already logged in
        const checkUser = async () => {
            const user = await MockService.getCurrentUser();
            // Only redirect if user exists AND has completed onboarding (college is not Unknown)
            if (user && user.college !== 'Unknown') {
                router.push('/discover');
            }
        };
        checkUser();
    }, [router]);

    const handleNext = async () => {
        setErrorMsg('');
        if (step === 1) {
            // Send OTP
            setLoading(true);
            const { error } = await AuthService.signInWithOtp(formData.email);
            setLoading(false);

            if (error) {
                setErrorMsg('Error sending OTP: ' + error.message);
                return;
            }
            setStep(prev => prev + 1);
            return;
        }
        if (step === 2) {
            // Verify OTP
            setLoading(true);
            const { data, error } = await AuthService.verifyOtp(formData.email, formData.otp);

            if (error) {
                setLoading(false);
                setErrorMsg('Invalid OTP: ' + error.message);
                return;
            }

            // Check if user profile exists and is complete
            const user = await MockService.getCurrentUser();
            if (user && user.college !== 'Unknown') {
                router.push('/discover');
                return;
            }

            setLoading(false);
            setStep(prev => prev + 1);
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleFinish = async () => {
        setLoading(true);
        // Get the auth user ID from session if available, or fallback to random (for mock)
        // Get the auth user ID from session
        const session = await AuthService.getSession();
        let userId = session?.user?.id;

        if (!userId) {
            // Fallback: try to get from current user (if session is active but getSession returned null for some reason)
            const currentUser = await MockService.getCurrentUser();
            userId = currentUser?.id;
        }

        if (!userId) {
            // Last resort fallback (should not happen in real auth flow)
            userId = Math.random().toString(36).substr(2, 9);
            console.warn('Using random user ID for onboarding save - this may cause issues if auth is active');
        }

        const newUser = {
            id: userId,
            ...formData,
            interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
            profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        };
        const savedUser = await MockService.saveCurrentUser(newUser);

        if (!savedUser) {
            setLoading(false);
            setErrorMsg('Failed to save profile. Please try again.');
            return;
        }

        setLoading(false);
        router.push('/discover');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-blue-600 text-2xl font-bold">
                        {step === 0 ? 'Welcome to Campus Connect' :
                            step === 1 ? 'Login' :
                                step === 2 ? 'Verify OTP' :
                                    step === 3 ? 'Academic Details' : 'Create Profile'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {errorMsg && (
                        <div className="mb-4 p-2 bg-red-100 text-red-600 text-sm rounded text-center">
                            {errorMsg}
                        </div>
                    )}
                    {step === 0 && (
                        <div className="text-center space-y-4">
                            <p className="text-gray-600">
                                Connect with students from your college, branch, and year.
                            </p>
                            <div className="flex justify-center">
                                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">🎓</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-center text-sm text-gray-500">Enter your email address to continue</p>
                            <Input
                                type="email"
                                placeholder="student@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-center text-sm text-gray-500">Enter the OTP sent to {formData.email}</p>
                            <div className="flex justify-center">
                                <OTPInput
                                    length={8}
                                    value={formData.otp}
                                    onChange={(val) => setFormData({ ...formData, otp: val })}
                                />
                            </div>
                            <p className="text-center text-xs text-blue-600 cursor-pointer" onClick={() => setStep(1)}>
                                Change Email
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">College</label>
                                <Select
                                    value={formData.college}
                                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                >
                                    <option value="">Select College</option>
                                    {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Branch</label>
                                <Select
                                    value={formData.branch}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                >
                                    <option value="">Select Branch</option>
                                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Year</label>
                                <Select
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                >
                                    <option value="">Select Year</option>
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bio (Optional)</label>
                                <Input
                                    placeholder="Tell us about yourself"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Interests (comma separated)</label>
                                <Input
                                    placeholder="Coding, Music, Sports"
                                    value={formData.interests}
                                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    {step === 0 && (
                        <Button className="w-full" onClick={handleNext}>Get Started</Button>
                    )}
                    {step === 1 && (
                        <Button
                            className="w-full"
                            onClick={handleNext}
                            disabled={!formData.email || !formData.email.includes('@') || loading}
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </Button>
                    )}
                    {step === 2 && (
                        <Button
                            className="w-full"
                            onClick={handleNext}
                            disabled={formData.otp.length !== 8 || loading}
                        >
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </Button>
                    )}
                    {step === 3 && (
                        <Button
                            className="w-full"
                            onClick={handleNext}
                            disabled={!formData.college || !formData.branch || !formData.year}
                        >
                            Next
                        </Button>
                    )}
                    {step === 4 && (
                        <Button
                            className="w-full"
                            onClick={handleFinish}
                            disabled={!formData.name || !formData.username || loading}
                        >
                            {loading ? 'Creating Profile...' : 'Complete Profile'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
