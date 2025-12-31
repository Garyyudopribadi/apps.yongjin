'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ChevronLeft, ChevronRight, Maximize2, Trophy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import Link from 'next/link';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Data ---
interface Design {
    id: string;
    title: string;
    src: string;
    author: string;
    description: string;
    category: 'Poster' | 'Design visual lobby';
}

const DESIGNS: Design[] = [
    { id: '1', title: 'Eco Haven', src: '/Design/DESAIN 1.png', author: '-', description: 'A sustainable sanctuary blending modern architecture with lush greenery.', category: 'Design visual lobby' },
    { id: '2', title: 'Nature Call', src: '/Design/DESAIN 2.jpeg', author: '-', description: 'Responding to the call of the wild with organic shapes and natural materials.', category: 'Design visual lobby' },
    { id: '3', title: 'Leaf Life', src: '/Design/DESAIN 3.jpeg', author: 'Chaidar Alfarizqy', description: 'Living spaces inspired by the intricate structure of leaves.', category: 'Design visual lobby' },
    { id: '4', title: 'Green Future', src: '/Design/DESAIN 4.png', author: '-', description: 'A vision of the future where cities and forests coexist in harmony.', category: 'Design visual lobby' },
    { id: '5', title: 'Urban Jungle', src: '/Design/DESAIN 5.png', author: '-', description: 'Reclaiming the concrete jungle with vertical gardens and rooftop parks.', category: 'Design visual lobby' },
    { id: '6', title: 'Pure Breath', src: '/Design/DESAIN 6.png', author: '-', description: 'Designed to maximize natural ventilation and air purification.', category: 'Design visual lobby' },
    { id: '7', title: 'Solar Soul', src: '/Design/DESAIN 7.png', author: '-', description: 'Harnessing the power of the sun for a net-zero energy footprint.', category: 'Design visual lobby' },
    { id: '8', title: 'Water Way', src: '/Design/DESAIN 8.png', author: '-', description: 'Integrating water features for cooling and tranquility.', category: 'Design visual lobby' },
    { id: '9', title: 'Forest Edge', src: '/Design/DESAIN 9.png', author: '-', description: 'Living on the edge of the forest with minimal impact on the ecosystem.', category: 'Design visual lobby' },
    { id: '10', title: 'Sky Garden', src: '/Design/DESAIN 10.png', author: '-', description: 'Elevating nature to new heights in this vertical garden skyscraper.', category: 'Design visual lobby' },
    { id: '11', title: 'Bamboo Zen', src: '/Design/DESAIN 11.png', author: '-', description: 'Finding peace and sustainability in the strength of bamboo.', category: 'Design visual lobby' },
    { id: '12', title: 'Recycle Art', src: '/Design/DESAIN 12.png', author: '-', description: 'Turning waste into wonder with 100% recycled building materials.', category: 'Design visual lobby' },
    { id: '13', title: 'Organic Form', src: '/Design/DESAIN 13.png', author: '-', description: 'Breaking free from the grid with fluid, organic architectural forms.', category: 'Design visual lobby' },
    { id: '14', title: 'Poster One', src: '/Design/Sample Poster (1).png', author: '-', description: 'A bold graphic statement on the importance of conservation.', category: 'Poster' },
    { id: '15', title: 'Poster Two', src: '/Design/Sample Poster (2).jpg', author: '-', description: 'Visualizing the beauty of our planet through sustainable design.', category: 'Poster' },
    { id: '16', title: 'Entrance View', src: '/Design/입구.png', author: '-', description: 'The grand entrance to a greener, more sustainable world.', category: 'Design visual lobby' },
];

// --- Components ---

const DesignModal = ({
    design,
    isOpen,
    onClose,
    isLiked,
    onToggleLike,
    likesCount
}: {
    design: Design | null;
    isOpen: boolean;
    onClose: () => void;
    isLiked: boolean;
    onToggleLike: () => void;
    likesCount: number;
}) => {
    if (!design) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-white/30 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-6xl bg-white/90 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col md:flex-row max-h-[90vh] border border-white/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-20 p-2 bg-black/10 hover:bg-black/20 text-gray-800 rounded-full transition-colors backdrop-blur-md"
                        >
                            <X size={20} />
                        </button>

                        {/* Image Side - Full Fit */}
                        <div className="w-full md:w-3/4 bg-gray-100/50 relative group flex items-center justify-center p-4">
                            <img
                                src={design.src}
                                alt={design.title}
                                className="w-full h-full object-contain max-h-[85vh]"
                            />
                        </div>

                        {/* Content Side */}
                        <div className="w-full md:w-1/4 p-8 flex flex-col justify-between bg-white/60 backdrop-blur-xl border-l border-white/50 overflow-y-auto">
                            <div>
                                <div className="mb-4">
                                    <span className={cn(
                                        "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                        design.category === 'Poster' ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"
                                    )}>
                                        {design.category}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">{design.title}</h2>
                                <p className="text-sm font-medium text-gray-500 mb-6">by {design.author}</p>
                                <p className="text-gray-600 text-sm leading-relaxed mb-8">
                                    {design.description}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col items-center gap-4 p-6 bg-white/50 rounded-3xl border border-white/60 shadow-sm">
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Total Votes</p>
                                        <p className="text-4xl font-bold text-gray-900 tracking-tighter">{likesCount}</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.92 }}
                                        onClick={onToggleLike}
                                        className={cn(
                                            "w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-sm",
                                            isLiked
                                                ? "bg-red-500 text-white shadow-red-500/20"
                                                : "bg-gray-900 text-white hover:bg-gray-800"
                                        )}
                                    >
                                        <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                                        {isLiked ? 'Voted' : 'Vote Design'}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const TopRatedNotification = ({
    onClick,
    voteCounts
}: {
    onClick: (id: string) => void;
    voteCounts: Record<string, number>;
}) => {
    const [featuredId, setFeaturedId] = useState<string | null>(null);

    useEffect(() => {
        // Find the design with the highest real vote count
                let maxVotes = -1;
                let topId: string | null = null;
        
                DESIGNS.forEach(d => {
                    const votes = voteCounts[d.id] || 0;
                    if (votes > maxVotes) {
                        maxVotes = votes;
                        topId = d.id;
                    }
                });
        
                if (topId) {
                    setFeaturedId(topId);
                }
    }, [voteCounts]);

    const featuredDesign = DESIGNS.find(d => d.id === featuredId);
    if (!featuredDesign) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6, type: "spring" }}
            className="fixed bottom-8 right-8 z-40 cursor-pointer"
            onClick={() => onClick(featuredDesign.id)}
        >
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-4 max-w-xs hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full flex items-center justify-center text-yellow-600 flex-shrink-0 shadow-inner">
                    <Trophy size={18} className="fill-current" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-0.5">Top Rated</p>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{featuredDesign.title}</p>
                    <p className="text-[10px] text-gray-500">{voteCounts[featuredDesign.id] || 0} likes</p>
                </div>
            </div>
        </motion.div>
    );
};

const DesignSlider = ({
    designs,
    likedDesigns,
    onSelect
}: {
    designs: Design[];
    likedDesigns: string[];
    onSelect: (id: string) => void;
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth < 768 ? 300 : 400;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group/slider animate-in fade-in duration-500">
            {/* Navigation Buttons - Refined Style (Square-ish Glass) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 hidden md:block opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => scroll('left')}
                    className="w-12 h-12 flex items-center justify-center bg-white/60 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white hover:scale-105 transition-all text-gray-800 border border-white/40 group/btn"
                >
                    <ChevronLeft size={24} className="group-hover/btn:-translate-x-0.5 transition-transform" />
                </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 hidden md:block opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => scroll('right')}
                    className="w-12 h-12 flex items-center justify-center bg-white/60 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white hover:scale-105 transition-all text-gray-800 border border-white/40 group/btn"
                >
                    <ChevronRight size={24} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto px-6 md:px-12 pb-12 pt-4 snap-x snap-mandatory scrollbar-hide touch-pan-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {designs.map((design) => {
                    const isLiked = likedDesigns.includes(design.id);
                    return (
                        <motion.div
                            key={design.id}
                            className="relative flex-shrink-0 w-[280px] md:w-[340px] aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer group snap-center shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
                            onClick={() => onSelect(design.id)}
                            whileHover={{ y: -12, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <img
                                src={design.src}
                                alt={design.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Visible Like Status */}
                            <div className="absolute top-4 right-4 z-10">
                                <motion.div
                                    initial={false}
                                    animate={{ scale: isLiked ? 1 : 0.8, opacity: isLiked ? 1 : 0 }}
                                    className={cn(
                                        "p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg",
                                        isLiked ? "bg-red-500 text-white shadow-red-500/30" : "bg-black/20 text-white opacity-0 group-hover:opacity-100"
                                    )}
                                >
                                    <Heart size={18} className={cn(isLiked && "fill-current")} />
                                </motion.div>
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2">{design.author}</p>
                                <h3 className="text-xl font-bold mb-4 leading-tight">{design.title}</h3>

                                <div className="flex items-center gap-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">View Details</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default function VoteGreenDesignPage() {
    const [likedDesigns, setLikedDesigns] = useState<string[]>([]);
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
    const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<'Lobby' | 'Poster'>('Lobby');
    const [mounted, setMounted] = useState(false);

    // Fetch initial data
    useEffect(() => {
        setMounted(true);

        // Load local user likes
        const savedLikes = localStorage.getItem('greenDesignLikes_v2');
        if (savedLikes) {
            setLikedDesigns(JSON.parse(savedLikes));
        }

        // Load global vote counts from API
        fetch('/api/vote')
            .then(res => res.json())
            .then(data => setVoteCounts(data))
            .catch(err => console.error('Failed to fetch votes:', err));
    }, []);

    const toggleLike = async (id: string) => {
        const isLiked = likedDesigns.includes(id);
        let newLikes: string[];

        // Optimistic UI update
        if (isLiked) {
            newLikes = likedDesigns.filter(d => d !== id);
            setVoteCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
        } else {
            newLikes = [...likedDesigns, id];
            setVoteCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
        }

        setLikedDesigns(newLikes);
        localStorage.setItem('greenDesignLikes_v2', JSON.stringify(newLikes));

        // API Call
        try {
            await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    action: isLiked ? 'decrement' : 'increment'
                })
            });
        } catch (error) {
            console.error('Failed to update vote:', error);
        }
    };

    if (!mounted) return null;

    const selectedDesign = DESIGNS.find(d => d.id === selectedDesignId) || null;

    const displayedDesigns = DESIGNS.filter(d =>
        activeCategory === 'Lobby'
            ? d.category === 'Design visual lobby'
            : d.category === 'Poster'
    );

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans overflow-x-hidden selection:bg-green-500/30 flex flex-col">

            {/* Glass Header - Updated with Main Logo */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 transition-all duration-300">
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
                    {/* Logo from Navbar */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/yongjinlogo.png"
                            alt="Yongjin Logo"
                            width={3000}
                            height={1856}
                            className="h-10 w-auto sm:h-12 sm:w-auto"
                            priority
                        />
                        <span className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">YONGJIN</span>
                    </Link>

                    <div className="text-xs font-bold bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-white/50 text-gray-600 tracking-wide">
                        {likedDesigns.length} VOTES CAST
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20 flex-grow">
                <div className="px-6 md:px-12 mb-8 mt-8">
                    <h2 className="text-4xl md:text-5xl font-bold max-w-3xl leading-[1.1] tracking-tight text-gray-900 mb-6">
                        Sustainable Design <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Green Vote</span>
                    </h2>

                    {/* Category Toggle */}
                    <div className="inline-flex p-1 bg-gray-200/50 backdrop-blur-sm rounded-full relative">
                        <button
                            onClick={() => setActiveCategory('Lobby')}
                            className={cn(
                                "w-40 h-10 rounded-full text-sm font-bold transition-all duration-300 relative z-10 flex items-center justify-center",
                                activeCategory === 'Lobby' ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Visual Lobby
                        </button>
                        <button
                            onClick={() => setActiveCategory('Poster')}
                            className={cn(
                                "w-40 h-10 rounded-full text-sm font-bold transition-all duration-300 relative z-10 flex items-center justify-center",
                                activeCategory === 'Poster' ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Posters
                        </button>

                        {/* Sliding Background */}
                        <motion.div
                            className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm"
                            initial={false}
                            animate={{
                                left: activeCategory === 'Lobby' ? 4 : 164,
                                width: 160
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </div>
                </div>

                <DesignSlider
                    designs={displayedDesigns}
                    likedDesigns={likedDesigns}
                    onSelect={setSelectedDesignId}
                />

            </main>

            {/* Footer */}
            <footer className="py-8 bg-white/50 backdrop-blur-md border-t border-white/50 mt-auto">
                <div className="container mx-auto px-6 md:px-12 text-center space-y-2">
                    <p className="text-xs text-gray-500 font-medium">
                        © 2025 PT.YONGJIN JAVASUKA GARMENT. All rights reserved.
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold tracking-wide">
                        ⚡ Powered & Created By Garyudo.
                    </p>
                </div>
            </footer>

            <TopRatedNotification onClick={setSelectedDesignId} voteCounts={voteCounts} />

            <DesignModal
                design={selectedDesign}
                isOpen={!!selectedDesign}
                onClose={() => setSelectedDesignId(null)}
                isLiked={selectedDesign ? likedDesigns.includes(selectedDesign.id) : false}
                likesCount={selectedDesign ? (voteCounts[selectedDesign.id] || 0) : 0}
                onToggleLike={() => selectedDesign && toggleLike(selectedDesign.id)}
            />

        </div>
    );
}
