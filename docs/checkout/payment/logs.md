PS C:\webdev\sang-logium> node scripts/get-trace.mjs chk_1748265432_x7k3m9q
No events found for traceId: chk_1748265432_x7k3m9q
PS C:\webdev\sang-logium> node scripts/get-trace.mjs chk_1779805129196_z4lyjuh
{
  "traceId": "chk_1779805129196_z4lyjuh",
  "eventCount": 26,
  "events": [
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
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
      "timestamp": "2026-05-26T14:18:49.605Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "payment-submit",
      "event": "address_form_submit",
      "data": {
        "regionCode": "PL",
        "postalCode": "54-129",
        "street": "Balonowa",
        "streetNumber": "9",
        "city": "Wrocław"
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:18:56.729Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "address_submit_start",
      "data": {
        "address": {
          "city": "Wrocław",
          "postalCode": "54-129"
        }
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:18:57.893Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "address_validation_result",
      "data": {
        "status": "ACCEPT"
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:18:58.533Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "address_saved",
      "data": {
        "hasAddress": true,
        "basketItemCount": 1
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:18:58.851Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "shipping_page_load",
      "data": {
        "hasAddress": true,
        "hasBasket": true
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:18:59.403Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "shipping_products_fetched",
      "data": {
        "basketIds": [
          "k27n1AQuIbSr5iozFz7FkW"
        ],
        "productCount": 1
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:00.054Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "shipping_packages_calculated",
      "data": {
        "packageCount": 1,
        "totalWeight": 0.9
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:00.474Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "shipping_allekurier_request",
      "data": {
        "payload": {
          "fromCountry": "PL",
          "fromZip": "00-533",
          "toCountry": "PL",
          "toZip": "54-129",
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
      "timestamp": "2026-05-26T14:19:00.882Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "allekurier_request_start",
      "data": {
        "fromCountry": "PL",
        "fromZip": "00-533",
        "toCountry": "PL",
        "toZip": "54-129",
        "packageCount": 1
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:01.271Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "allekurier_success",
      "data": {
        "serviceCount": 10,
        "route": "PL->PL"
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:02.938Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
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
      "timestamp": "2026-05-26T14:19:03.266Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "payment-submit",
      "event": "shipping_option_selected",
      "data": {
        "rateId": "dhl_dhlstandard",
        "provider": "DHL Parcel",
        "service": "DHL Standard",
        "amount": 27.92
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:10.145Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "shipping_selection_start",
      "data": {
        "shippingCode": "dhl_dhlstandard"
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:11.092Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "shipping_products_fetched",
      "data": {
        "productCount": 1,
        "basketIds": [
          "k27n1AQuIbSr5iozFz7FkW"
        ]
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:11.734Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "shipping_allekurier_request",
      "data": {
        "payload": {
          "fromCountry": "PL",
          "fromZip": "00-533",
          "toCountry": "PL",
          "toZip": "54-129",
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
      "timestamp": "2026-05-26T14:19:12.170Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "allekurier_request_start",
      "data": {
        "fromCountry": "PL",
        "fromZip": "00-533",
        "toCountry": "PL",
        "toZip": "54-129",
        "packageCount": 1
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:12.547Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "allekurier_success",
      "data": {
        "serviceCount": 10,
        "route": "PL->PL"
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:14.067Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
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
      "timestamp": "2026-05-26T14:19:14.405Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "shipping_option_selected",
      "data": {
        "provider": "DHL Parcel",
        "service": "DHL Standard",
        "amount": 27.92,
        "priceInCents": 2792
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:14.694Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "address-submit",
      "event": "shipping_saved",
      "data": {
        "shippingCode": "dhl_dhlstandard",
        "shippingCost": 2792
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:15.020Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "payment-init",
      "event": "payment_page_load",
      "data": {
        "hasBasket": true,
        "hasAddress": true,
        "hasShippingCost": true
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:15.555Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
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
      "timestamp": "2026-05-26T14:19:16.003Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "payment-init",
      "event": "payment_sanity_query_complete",
      "data": {
        "productCount": 1,
        "expectedCount": 1
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:16.646Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "payment-init",
      "event": "payment_calculation",
      "data": {
        "subtotal": 99900,
        "shippingCost": 2792,
        "grandTotal": 102692
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:17.102Z"
    },
    {
      "correlationId": "chk_1779805129196_z4lyjuh",
      "slice": "payment-init",
      "event": "payment_intent_create",
      "data": {
        "paymentIntentId": "pi_3TbLpCEQ2a2vW56g1fh0RBrw",
        "amount": 102692,
        "currency": "pln",
        "metadata": {
          "regionCode": "PL",
          "postalCode": "54-129",
          "street": "Balonowa",
          "streetNumber": "9",
          "city": "Wrocław",
          "email": "",
          "checkoutSessionId": "chk_1779805129196_z4lyjuh"
        }
      },
      "outcome": "success",
      "timestamp": "2026-05-26T14:19:18.111Z"
    }
  ]
}
PS C:\webdev\sang-logium> 