export default function RedesignFeaturedAndProductSpotlight() {
    return <>
        <section className="w-full bg-brand-700 py-20">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                <div className="mb-8 flex flex-col gap-2">
                    <span className="text-small tracking-editorial text-secondary-400 uppercase">Curated Excellence</span>
                    <h2 className="text-h2 text-brand-100 uppercase">Featured</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <article className="group flex flex-col gap-4 p-6 border border-secondary-800 rounded-lg bg-transparent transition-all duration-300 hover:border-secondary-600 hover:bg-secondary-900/10">
                        <div className="aspect-square w-full bg-brand-800/50 rounded-md overflow-hidden relative flex items-center justify-center p-8">
                            <img
                                src="/product-pi8.png"
                                alt="Bowers & Wilkins Pi8"
                                className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-small tracking-editorial text-secondary-500 uppercase">Bowers & Wilkins</span>
                            <h3 className="text-h4 text-brand-100 line-clamp-1 group-hover:text-accent-400 transition-colors">Pi8 In-Ear True Wireless</h3>
                            <p className="text-small text-secondary-400 line-clamp-2 leading-relaxed">Premium acoustic engineering with artisan craftsmanship.</p>
                        </div>

                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-secondary-800">
                            <div className="flex flex-col">
                                <span className="text-[10px] tracking-widest text-secondary-500 uppercase">Price</span>
                                <span className="text-h4 text-brand-100">$399</span>
                            </div>
                            <button className="relative flex items-center gap-2 overflow-hidden px-4 py-2 bg-accent-500 text-brand-900 rounded-sm transition-all duration-300 hover:bg-accent-400 active:scale-95">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                <span className="text-small font-bold uppercase tracking-tight">Add to Cart</span>
                            </button>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section className="w-full bg-brand-700 py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/fractal_ring.webp')] bg-no-repeat bg-right-bottom mix-blend-overlay opacity-20 pointer-events-none z-0"></div>

            <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div class="w-full flex justify-center lg:justify-start">
                        <div class="relative w-full max-w-[450px] aspect-square flex items-center justify-center">
                            <div class="absolute inset-0 bg-accent-500/5 blur-[100px] rounded-full"></div>
                            <img
                                src="/meze-liric.png"
                                alt="Meze Liric II"
                                class="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-4">
                        <button className="group flex items-center gap-4 text-h4 tracking-signature text-accent-500 uppercase transition-all">
                            <span className="border-b border-accent-500 pb-1 group-hover:border-accent-100 group-hover:text-accent-100 transition-all">See More</span>
                            <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>

                    <div className="w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-small tracking-editorial text-accent-500 uppercase">Meze</span>
                            <h2 className="text-h1 text-brand-100 uppercase">The Modern Standard</h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-h3 text-brand-400">Refined Closed-Back Excellence</h3>
                            <p className="text-body text-secondary-400 max-w-prose text-pretty">
                                The Meze Audio LIRIC II represents a harmonious blend of industrial design prowess and cutting-edge technological innovation. Designed for the active audiophile who demands both mobility and exceptional sound quality, the LIRIC II offers a refined sound profile that strikes a perfect balance between warmth and clarity.
                            </p>
                        </div>
                        <div className="mt-8 pt-4">
                            <button className="text-h4 tracking-editorial text-accent-500 uppercase border-b border-accent-500 pb-1 hover:text-accent-400 hover:border-accent-400 transition-colors w-fit">
                                See More
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
}