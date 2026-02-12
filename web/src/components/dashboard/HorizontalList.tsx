'use client';

import React from 'react';
import Link from 'next/link';
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper';
import { Product, Service } from '@/types';
import { motion } from 'framer-motion';

interface HorizontalListProps {
    title: string;
    items: (Product | Service)[];
    type: 'product' | 'service';
}

export function HorizontalList({ title, items, type }: HorizontalListProps) {
    if (items.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <Link href={type === 'product' ? '/shop' : '/services'} className="text-sm text-junr-blue hover:underline">
                    See All
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/${type === 'product' ? 'product' : 'service'}/${item.id}`}
                        className="flex-shrink-0 w-64 snap-start block"
                    >
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col"
                        >
                            <div className="h-40 w-full relative bg-gray-100 dark:bg-gray-700">
                                <img
                                    src={resolveImage(item.image_url, getDefaultImageForType(type, item.name))}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 h-10 overflow-hidden text-ellipsis">{item.description}</p>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="font-bold text-junr-blue">
                                        PKR {item.price}
                                    </span>
                                    {type === 'service' && (
                                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">
                                            {(item as Service).duration_mins} min
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
