export function PaymentMethodSelector() {
  return (
    <div className="space-y-3">
      <div className="border border-secondary-700 p-4 rounded-lg hover:border-brand-400 transition-colors">
        <label className="flex items-center gap-3">
          <input type="radio" name="payment" defaultChecked disabled />
          <div>
            <span className="text-brand-400 font-medium block">Pay with Klarna</span>
            <span className="text-xs text-secondary-500">3 interest-free installments</span>
          </div>
        </label>
      </div>

      <div className="border border-secondary-700 p-4 rounded-lg hover:border-brand-400 transition-colors">
        <label className="flex items-center gap-3">
          <input type="radio" name="payment" disabled />
          <div>
            <span className="text-brand-400 font-medium block">BLIK</span>
            <span className="text-xs text-secondary-500">Instant bank transfer</span>
          </div>
        </label>
      </div>

      <div className="border border-secondary-700 p-4 rounded-lg hover:border-brand-400 transition-colors">
        <label className="flex items-center gap-3">
          <input type="radio" name="payment" disabled />
          <div>
            <span className="text-brand-400 font-medium block">Card Payment</span>
            <span className="text-xs text-secondary-500">Visa, Mastercard, Amex</span>
          </div>
        </label>
      </div>
    </div>
  );
}
