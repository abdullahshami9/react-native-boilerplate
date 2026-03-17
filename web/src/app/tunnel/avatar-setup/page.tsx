'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { Loader2, Camera, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

const SKIN_TONES = [
    '#FFDFC4', '#F0D5BE', '#EECEB3', '#E1B899', '#E5C298',
    '#FFDCB2', '#E5B887', '#E5A073', '#D6A171', '#C67856',
    '#A5725D', '#9A7156', '#87513C', '#684534', '#462E25'
];

export default function AvatarSetupPage() {
    const { userInfo, updateUser } = useContext(AuthContext);
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form State
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [skinTone, setSkinTone] = useState('#FAD6B1');
    const [bodySize, setBodySize] = useState('M');

    const handleCameraSimulation = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    const submitAvatar = async () => {
        if (!height || !weight) {
            alert('Please fill in your height and weight.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/tunnel/avatar-setup', {
                user_id: userInfo?.id,
                height: parseFloat(height),
                weight: parseFloat(weight),
                skin_tone: skinTone,
                body_size: bodySize,
                avatar_url: 'https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb'
            });

            // Update local user state
            if (userInfo) {
                updateUser({ ...userInfo, is_tunnel_completed: true });
            }

            // Redirect to home/dashboard
            if (userInfo?.user_type === 'Business') {
                router.push('/business/stats');
            } else {
                router.push('/discover');
            }

        } catch (error) {
            console.error(error);
            alert('Failed to complete avatar setup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-junr-dark-bg p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">

                {step === 0 && (
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-20 h-20 bg-junr-blue/10 rounded-full flex items-center justify-center text-junr-blue">
                            <User className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create 3D Avatar</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                To use the virtual try-on feature, we need to create a 3D model that matches your body profile.
                            </p>
                        </div>
                        <Button className="w-full" onClick={() => setStep(1)}>
                            Start Face Scan
                        </Button>
                        <button
                            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            onClick={() => setStep(2)}
                        >
                            Skip to manual entry
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-full border-4 border-dashed border-junr-blue flex flex-col items-center justify-center relative overflow-hidden">
                            {loading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-junr-blue" />
                            ) : (
                                <>
                                    <Camera className="w-10 h-10 text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500">Camera not accessible on Web Demo</p>
                                </>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Web Simulation</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                Click below to simulate the scan completion.
                            </p>
                        </div>
                        <Button className="w-full" onClick={handleCameraSimulation} disabled={loading}>
                            {loading ? 'Processing Scan...' : 'Simulate Scan Complete'}
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Body Profile</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Enter your measurements for accurate virtual fitting.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Height (cm)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="175"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Weight (kg)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="70"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    General Size
                                </label>
                                <select
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-junr-blue outline-none transition-all"
                                    value={bodySize}
                                    onChange={(e) => setBodySize(e.target.value)}
                                >
                                    <option value="S">Small (S)</option>
                                    <option value="M">Medium (M)</option>
                                    <option value="L">Large (L)</option>
                                    <option value="XL">Extra Large (XL)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Skin Tone
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SKIN_TONES.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSkinTone(color)}
                                            style={{ backgroundColor: color }}
                                            className={`w-8 h-8 rounded-full transition-transform ${
                                                skinTone === color ? 'scale-125 ring-2 ring-junr-blue ring-offset-2 dark:ring-offset-gray-800' : 'hover:scale-110 border border-black/10'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-8"
                            onClick={submitAvatar}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Avatar & Finish'}
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}

// Quick fallback icon import for User if needed
import { User } from 'lucide-react';