export default function RedesignFeaturedAndProductSpotlight() {
    return <>
        <section className="w-full bg-brand-700 py-20">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                <div className="mb-8 flex flex-col gap-2">
                    <span className="text-small tracking-editorial text-secondary-400 uppercase">Curated Excellence</span>
                    <h2 className="text-h2 text-brand-100 uppercase">Featured</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <article className="flex flex-col gap-4 p-6 border border-secondary-800 rounded-lg bg-transparent transition-shadow hover:shadow-cardHover">
                        <div className="aspect-square w-full bg-brand-800 rounded-md overflow-hidden relative"></div>
                        <div className="flex flex-col gap-2">
                            <span className="text-small tracking-editorial text-secondary-500 uppercase">Bowers & Wilkins</span>
                            <h3 className="text-h4 text-brand-100 line-clamp-2">Pi8 In-Ear True Wireless</h3>
                            <p className="text-small text-secondary-400 line-clamp-2">Premium acoustic engineering with artisan craftsmanship.</p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-secondary-800">
                            <div className="flex flex-col">
                                <span className="text-small text-secondary-500 uppercase">Price</span>
                                <span className="text-h4 text-brand-100">$399</span>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 text-small tracking-editorial text-accent-500 uppercase hover:text-accent-400 transition-colors group">
                                <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                <span>Add to Cart</span>
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
                    <div className="w-full flex justify-center">
                        <div className="w-full max-w-[450px] aspect-square bg-brand-800 rounded-lg relative overflow-hidden"></div>
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