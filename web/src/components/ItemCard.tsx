'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper';
import { Product, Service } from '@/types';

interface ItemCardProps {
    item: Product | Service;
    type: 'product' | 'service';
}

export function ItemCard({ item, type }: ItemCardProps) {
    return (
        <Link
            href={`/${type === 'product' ? 'product' : 'service'}/${item.id}`}
            className="block h-full"
        >
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col hover:shadow-lg transition-shadow duration-300"
            >
                <div className="h-48 w-full relative bg-gray-100 dark:bg-gray-700">
                    <img
                        src={resolveImage(item.image_url, getDefaultImageForType(type, item.name))}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 h-10 overflow-hidden text-ellipsis">{item.description}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <span className="font-bold text-junr-blue text-lg">
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
    );
}
