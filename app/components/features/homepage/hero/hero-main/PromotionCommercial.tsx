interface PromotionCommercialProps {
  description: string;
  discountPercent: number;
  actionLabel: string;
  actionLink?: string | null;
}

export default function PromotionCommercial({
  textData,
}: PromotionCommercialProps) {
  console.log("textData", textData);
  // [
  //     {
  //         "color": "#c2410c",
  //         "highlighted": true,
  //         "text": "ALL"
  //     },
  //     {
  //         "color": null,
  //         "highlighted": false,
  //         "text": "wired headphones"
  //     }
  // ]

  const description = textData.description;
  // input

  // map => return VALID HTML per iteration
  // get data
  // determine color or just text
  // put into html
  // return
  // output
  // <span style={{color: color}}>{text}</span> <span>{text}</span>

  // description.map((el) =>
  //   el.highlighted ? (
  //     <span style={{ color: el.color }}>{el.text}</span>
  //   ) : (
  //     <span>{el.text}</span>
  //   )
  // );

  // return null;
  return (
    <div className="absolute z-50 grid h-full w-full place-content-center">
      {/* Content Container */}
      <div className="dmSerifDisplay mx-4 grid place-items-center gap-8 rounded-sm bg-black/40 px-8 py-6 font-serif text-white sm:px-12 sm:py-12 lg:py-28">
        {/* <p className="max-w-2xl text-center text-xl font-black sm:text-3xl lg:text-5xl">
          {headline}
        </p> */}

        {/* Description */}
        <p className="max-w-2xl text-center text-xl font-black sm:text-3xl lg:text-5xl">
          {/* {description} */}
          {description.map((el) =>
            el.highlighted ? (
              <span key={textData._id + el.text} style={{ color: el.color }}>
                {el.text}
              </span>
            ) : (
              <span key={textData._id + el.text}>{el.text}</span>
            )
          )}
        </p>

        {/* <div className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white sm:text-base">
          {discountPercent}% Off
        </div> */}
      </div>

      {/* CTA Button */}
      {/* {actionLabel && (
        <div className="mt-8 grid place-items-center">
          <a
            href={actionLink || "#"}
            className="max-w-xs rounded-sm bg-amber-700 px-8 py-3 text-center text-sm font-black tracking-wide text-white transition-colors hover:bg-amber-800 sm:max-w-sm sm:py-4 sm:text-lg"
          >
            {actionLabel}
          </a>
        </div>
      )} */}
    </div>
  );
}
