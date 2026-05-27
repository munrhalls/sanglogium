PS C:\webdev\sang-logium> node scripts/get-trace.mjs 
Using latest trace: chk_1779885256609_q1mzg40

{
  "traceId": "chk_1779885256609_q1mzg40",
  "eventCount": 21,
  "events": [
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "basket-address",
      "event": "checkout_init",
      "data": {
        "itemCount": 1,
        "items": [
          {
            "productId": "k27n1AQuIbSr5iozFz7FkW",
            "quantity": 1
          }
        ]
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:17.305Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "payment-submit",
      "event": "address_form_submit",
      "data": {
        "regionCode": "PL",
        "postalCode": "54-153",
        "street": "Pałucka",
        "streetNumber": "71/5",
        "city": "Wrocław"
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:24.972Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "address_submit_start",
      "data": {
        "address": {
          "city": "Wrocław",
          "postalCode": "54-153"
        }
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:25.949Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "address_validation_result",
      "data": {
        "status": "ACCEPT"
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:26.737Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "address_saved",
      "data": {
        "hasAddress": true,
        "basketItemCount": 1
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:27.071Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "shipping_page_load",
      "data": {
        "hasAddress": true,
        "hasBasket": true
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:28.838Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "shipping_products_fetched",
      "data": {
        "basketIds": [
          "k27n1AQuIbSr5iozFz7FkW"
        ],
        "productCount": 1
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:29.484Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "shipping_packages_calculated",
      "data": {
        "packageCount": 1,
        "totalWeight": 0.9
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:29.802Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "shipping_allekurier_request",
      "data": {
        "payload": {
          "fromCountry": "PL",
          "fromZip": "00-533",
          "toCountry": "PL",
          "toZip": "54-153",
          "packages": [
            {
              "weight": 0.9,
              "width": 22,
              "height": 12,
              "length": 25
            }
          ]
        },
        "packageCount": 1,
        "totalWeight": 0.9
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:30.119Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "allekurier_request_start",
      "data": {
        "fromCountry": "PL",
        "fromZip": "00-533",
        "toCountry": "PL",
        "toZip": "54-153",
        "packageCount": 1
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:30.489Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "allekurier_success",
      "data": {
        "serviceCount": 10,
        "route": "PL->PL"
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:31.967Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "shipping_allekurier_response",
      "data": {
        "rateCount": 10,
        "rates": [
          {
            "carrier": "Orlen Paczka",
            "service": "Orlen Paczka",
            "price": 11.71
          },
          {
            "carrier": "InPost Paczkomaty",
            "service": "Inpost Paczkomaty 24/7",
            "price": 17.27
          },
          {
            "carrier": "InPost Kurier",
            "service": "InPost Kurier",
            "price": 22.41
          },
          {
            "carrier": "DPD Polska",
            "service": "DPD Classic",
            "price": 23.21
          },
          {
            "carrier": "FedEx Polska",
            "service": "FedEx Economy",
            "price": 23.57
          },
          {
            "carrier": "DHL Parcel",
            "service": "DHL Standard",
            "price": 27.92
          },
          {
            "carrier": "UPS Polska",
            "service": "UPS Access Point to Access Point",
            "price": 28.38
          },
          {
            "carrier": "UPS Polska",
            "service": "UPS Access Point to Door",
            "price": 39.42
          },
          {
            "carrier": "UPS Polska",
            "service": "UPS Standard",
            "price": 42.9
          },
          {
            "carrier": "UPS Polska",
            "service": "UPS Express Saver",
            "price": 55.24
          }
        ]
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:32.318Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "shipping_selection_start",
      "data": {
        "shippingCode": "orlen_paczkawruchu"
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:36.050Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "payment-submit",
      "event": "shipping_option_selected",
      "data": {
        "rateId": "orlen_paczkawruchu",
        "provider": "Orlen Paczka",
        "service": "Orlen Paczka",
        "amount": 11.71
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:36.218Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "shipping_option_selected",
      "data": {
        "shippingCode": "orlen_paczkawruchu",
        "priceInCents": 1171
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:36.603Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "address-submit",
      "event": "shipping_saved",
      "data": {
        "shippingCode": "orlen_paczkawruchu",
        "shippingCost": 1171
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:36.838Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "payment-init",
      "event": "payment_page_load",
      "data": {
        "hasBasket": true,
        "hasAddress": true,
        "hasShippingCost": true
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:38.518Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "payment-init",
      "event": "payment_sanity_query_start",
      "data": {
        "productIds": [
          "k27n1AQuIbSr5iozFz7FkW"
        ],
        "quantities": [
          {
            "productId": "k27n1AQuIbSr5iozFz7FkW",
            "quantity": 1
          }
        ]
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:38.977Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "payment-init",
      "event": "payment_sanity_query_complete",
      "data": {
        "productCount": 1,
        "expectedCount": 1
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:39.587Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "payment-init",
      "event": "payment_calculation",
      "data": {
        "subtotal": 99900,
        "shippingCost": 1171,
        "grandTotal": 101071
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:39.966Z"
    },
    {
      "correlationId": "chk_1779885256609_q1mzg40",
      "slice": "payment-init",
      "event": "payment_intent_create",
      "data": {
        "paymentIntentId": "pi_3TbgfVEQ2a2vW56g0xFL0bXA",
        "amount": 101071,
        "currency": "pln"
      },
      "outcome": "success",
      "timestamp": "2026-05-27T12:34:41.084Z"
    }
  ]
}
PS C:\webdev\sang-logium> 