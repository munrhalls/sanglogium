# Sanglogium Sender Addresses

This document documents the verified sender address configurations used in production for the shipping rates API.

## Poland (PL)

**Company:** Sang Logium PL
**Address:** Mokotowska 63, 00-533 Warszawa, Poland
**State:** MZ (Mazowieckie)
**Phone:** +48123456789
**Email:** pl@sanglogium.com

**Verification:**
- Postal code verified via Polish postal code DB (kody-pocztowe.com.pl)
- No audio competitor at address

## Germany (DE)

**Company:** Sang Logium DE
**Address:** Residenzstraße 18, 80333 München, Germany
**State:** BY (Bayern)
**Phone:** +49123456789
**Email:** de@sanglogium.com

**Verification:**
- Address verified via Yelp and Fivmagazine (Balenciaga store reference)
- No audio competitor at address

## United Kingdom (GB)

**Company:** Sang Logium GB
**Address:** 17 Kensington Church Street, W8 4LF London, United Kingdom
**State:** ENG (England)
**Phone:** +44123456789
**Email:** gb@sanglogium.com

**Verification:**
- Address verified via UK Postcode Check and Levy Real Estate
- No audio competitor at address

## Environment Variable Configuration

These addresses are configured in `.env` using the following pattern:

```bash
# Poland (PL)
SENDER_ADDRESS_PL_NAME=Sang Logium PL
SENDER_ADDRESS_PL_STREET=Mokotowska 63
SENDER_ADDRESS_PL_CITY=Warszawa
SENDER_ADDRESS_PL_STATE=MZ
SENDER_ADDRESS_PL_ZIP=00-533
SENDER_ADDRESS_PL_COUNTRY=PL
SENDER_ADDRESS_PL_PHONE=+48123456789
SENDER_ADDRESS_PL_EMAIL=pl@sanglogium.com

# Germany (DE)
SENDER_ADDRESS_DE_NAME=Sang Logium DE
SENDER_ADDRESS_DE_STREET=Residenzstraße 18
SENDER_ADDRESS_DE_CITY=München
SENDER_ADDRESS_DE_STATE=BY
SENDER_ADDRESS_DE_ZIP=80333
SENDER_ADDRESS_DE_COUNTRY=DE
SENDER_ADDRESS_DE_PHONE=+49123456789
SENDER_ADDRESS_DE_EMAIL=de@sanglogium.com

# United Kingdom (GB)
SENDER_ADDRESS_GB_NAME=Sang Logium GB
SENDER_ADDRESS_GB_STREET=17 Kensington Church Street
SENDER_ADDRESS_GB_CITY=London
SENDER_ADDRESS_GB_STATE=ENG
SENDER_ADDRESS_GB_ZIP=W8 4LF
SENDER_ADDRESS_GB_COUNTRY=GB
SENDER_ADDRESS_GB_PHONE=+44123456789
SENDER_ADDRESS_GB_EMAIL=gb@sanglogium.com
```

## Selection Logic

The shipping rates API automatically selects the appropriate sender address based on the destination country code (`regionCode`):

1. **PL destinations** → Sang Logium PL (Warsaw)
2. **DE destinations** → Sang Logium DE (Munich)
3. **GB destinations** → Sang Logium GB (London)
4. **Other countries** → Currently not configured (requires `SENDER_ADDRESS_DEFAULT_*` or base fallback)

See [README.md](./README.md#sender-address-configuration) for full environment variable convention and fallback logic.