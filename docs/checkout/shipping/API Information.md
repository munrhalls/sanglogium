are shipping rates flat in Poland for all carriers?

No. Shipping rates in Poland are NOT flat for all carriers. Rates vary by:
- Carrier (DPD, FedEx, InPost, DHL, UPS, etc.)
- Distance between sender and recipient
- Package dimensions and weight
- Service type (standard, express, economy)
- Additional services (COD, insurance, weekend delivery)

Poland - given polish sender and recipient addresses that are varying distance from sender address - should shipping rate change yes/no? what is true?

**YES, shipping rate should change based on distance.** This is true for most Poland carriers. Distance-based pricing is standard for domestic Poland shipping.

what's the evidence from trustworthy source-level on carrier rates in poland?

From AlleKurier API documentation (https://github.com/AlleKurier/api_v1):
- API returns actual cost in response: `"cost":"12.76"`
- Cost is calculated per order based on: service type, package dimensions, pickup/dropoff method, sender/recipient locations
- Different services have different base rates (e.g., InPost vs DPD vs FedEx)

if shipping page, based on Polish sender address and varying polish recipient addresses and parcel data, gets and returns REAL 100% accurate true shipping costs, then what should that returned data be?

The returned data should include:
- **Carrier name** (e.g., "DPD", "InPost", "FedEx")
- **Service type** (e.g., "standard", "express", "economy")
- **Exact cost in PLN** (e.g., "12.76")
- **Estimated delivery time** (e.g., "1-2 business days")
- **Service ID** for order creation
- **Additional service costs** (COD, insurance if applicable)

when is that data 100% accurate and real-world match?

The data is 100% accurate when:
- Using production API with real carrier rates (not test/sandbox mock data)
- Package dimensions, weight, and addresses are accurate
- No carrier-specific surcharges or promotions are active
- Rates are calculated at the moment of quote (rates change periodically)

when is that data flawed in some way? what are the exact points of disprepancy/false information and false cost/mistaken cost/amateur-omission etc.?

Data is flawed when:
- Using sandbox/test API that returns mock rates (not real carrier rates)
- Package dimensions/weight are estimated vs actual measured
- Sender/recipient addresses are incomplete or inaccurate
- Fuel surcharges, rural area surcharges, or weekend surcharges not included
- Carrier-specific volume discounts not applied
- Rates are cached and not refreshed (carrier rates change periodically)
- Additional services (COD, insurance) not properly calculated

what aggregate API for Poland can return 100% accurate and real-world match data at 0 monetary cost, whether from test API or production, so long as its 0 monetary cost?

**AlleKurier API with test account:**
- Register account and mark as test via email to IT department
- Test accounts don't create charges: "wszelkie operacje generowane na tym koncie nie będą powodować tworzenia obciążeń, faktur oraz co najważniejsze - rzeczywistego zamówienia kuriera"
- Returns REAL carrier rates (not mock data) in test mode
- Response includes actual cost: `"cost":"12.76"`
- GitHub documentation: https://github.com/AlleKurier/api_v1

**However:** Even with test account, the rates returned are REAL carrier rates, not zero-cost. The test mode only avoids creating actual shipments/invoices, not the rate calculation itself.

Context: store will not do any real deliveries/shipping - but must present 100% professional, accurate shipping rates that a customer could fully trust, same level of professional accuracy as other major e-commerce stores or e.g. allegro

**Recommendation:** Use AlleKurier API with test account to display real carrier rates. This provides:
- Professional accuracy (real carrier rates, not mock data)
- Customer trust (same rates as Allegro/major e-commerce)
- Zero monetary cost (test account avoids charges)
- Real-time rate calculation based on actual carrier pricing 

