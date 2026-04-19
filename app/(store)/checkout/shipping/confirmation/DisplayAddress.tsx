import { ShippingAddress } from "../../layout";

const DisplayAddress = function ({
  shippingAddress,
}: {
  shippingAddress: ShippingAddress;
}) {
  const countryMap: Record<string, string> = {
    EN: "England",
    PL: "Poland",
  };
  const countryName = countryMap[shippingAddress.regionCode];
  //   good enough for now
  return (
    <div>
      <h2 className="mb-1 text-base font-bold">Shipping Address</h2>
      <div className="text-base leading-tight text-gray-700">
        <p className="flex gap-1">
          <span>{shippingAddress.street}</span>
          <span>{shippingAddress.streetNumber}</span>
        </p>
        <p className="flex gap-1">
          <span>{shippingAddress.city}</span>
          <span>{shippingAddress.postalCode}</span>
        </p>
        <p>{countryName}</p>
      </div>
    </div>
  );
};

export default DisplayAddress;
