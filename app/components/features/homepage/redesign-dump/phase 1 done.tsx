export default function RedesignFeaturedAndProductSpotlight() {
    return <> <section className="w-full bg-brand-700 py-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
            <div className="mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <article className="flex flex-col gap-4 p-6 border border-secondary-800 rounded-lg bg-transparent">
                    <div className="aspect-square w-full bg-brand-800 rounded-md"></div>
                    <div className="flex flex-col gap-2"></div>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-secondary-800">
                        <div></div>
                        <button className="flex items-center gap-2 px-4 py-2"></button>
                    </div>
                </article>

                <article className="flex flex-col gap-4 p-6 border border-secondary-800 rounded-lg bg-transparent">
                    <div className="aspect-square w-full bg-brand-800 rounded-md"></div>
                    <div className="flex flex-col gap-2"></div>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-secondary-800">
                        <div></div>
                        <button className="flex items-center gap-2 px-4 py-2"></button>
                    </div>
                </article>

                <article className="flex flex-col gap-4 p-6 border border-secondary-800 rounded-lg bg-transparent">
                    <div className="aspect-square w-full bg-brand-800 rounded-md"></div>
                    <div className="flex flex-col gap-2"></div>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-secondary-800">
                        <div></div>
                        <button className="flex items-center gap-2 px-4 py-2"></button>
                    </div>
                </article>
            </div>
        </div>
    </section>

        <section className="w-full bg-brand-700 py-20">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="w-full flex justify-center">
                        <div className="w-full max-w-[450px] aspect-square bg-brand-800 rounded-lg"></div>
                    </div>

                    <div className="w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-2"></div>
                        <div className="flex flex-col gap-4"></div>
                        <div className="mt-8 pt-4"></div>
                    </div>
                </div>
            </div>
        </section>
    </>
}