# Furgonetka API Test Plan - Poland Shipping Rate Calculation

**Cel:** Zweryfikować czy Furgonetka Sandbox API spełnia kontrakt eksperymentu obliczania stawek przesyłek w Polsce.

**Data:** 2026-05-14

---

## Krok 1: Rejestracja Konta Furgonetka

### 1.1 Otwórz stronę rejestracji
```
https://furgonetka.pl/rejestracja
```

### 1.2 Wypełnij formularz
- **Email:** Twój email
- **Hasło:** Silne hasło
- **Imię i nazwisko:** Twoje dane
- **Telefon:** Numer telefonu (opcjonalnie)

### 1.3 Potwierdź email
- Sprawdź skrzynkę email
- Kliknij w link potwierdzający
- Zaloguj się do konta

---

## Krok 2: Konfiguracja OAuth App

### 2.1 Przejdź do panelu OAuth
```
https://furgonetka.pl/api/aplikacje-oauth
```

### 2.2 Utwórz nową aplikację
- Kliknij "Dodaj aplikację" lub "Nowa aplikacja"
- **Nazwa:** `Poland Shipping Test`
- **Opis:** `Test API dla eksperymentu obliczania stawek przesyłek w Polsce`
- **Redirect URI:** `https://localhost:3000/callback` (lub inny placeholder)

### 2.3 Zapisz credentials
Po utworzeniu aplikacji zobaczysz:
- **Client ID:** Zapisz ten klucz
- **Client Secret:** Zapisz ten sekret (będzie widoczny tylko raz!)

**WAŻNE:** Zapisz te wartości w bezpiecznym miejscu.

---

## Krok 3: Uzyskanie Access Token (Sandbox)

### 3.1 Wyślij request do OAuth endpoint

Użyj Postman, curl, lub innego narzędzia do wysłania requestu:

```bash
curl -X POST https://api.sandbox.furgonetka.pl/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=TWOJ_CLIENT_ID" \
  -d "client_secret=TWOJ_CLIENT_SECRET"
```

### 3.2 Zapisz access token
Odpowiedź będzie zawierać:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Zapisz `access_token`** - będziesz go używał w kolejnych requestach.

---

## Krok 4: Przegląd Dokumentacji API REST

### 4.1 Otwórz dokumentację sandbox
```
https://sandbox.furgonetka.pl/api/rest?lang=en_GB
```

### 4.2 Znajdź endpoint kalkulacji ceny
Szukaj:
- "Kalkulacja ceny przesyłki" (Price calculation)
- "Price calculation"
- Endpoint z metodą POST

Zapisz:
- **Endpoint URL** (np. `/api/v1/price/calculate`)
- **Required parameters** (sender, receiver, package dimensions)
- **Response structure** (czy zawiera delivery time)

---

## Krok 5: Test Kalkulacji Ceny z 3 Adresami

### 5.1 Konfiguracja testu

**Paczka:**
- Wymiary: 15x15x15 cm
- Waga: 1.5 kg

**Nadawca:**
- Miasto: Warszawa
- Kod pocztowy: 00-533

**Odbiorcy:**
1. **Blisko:** Warszawa, kod 00-001 (~2-5km)
2. **Średnio:** Warszawa Praga, kod 03-xxx (~5-10km)
3. **Daleko:** Kraków, kod 30-001 (~300km)

### 5.2 Wykonaj 3 requesty

**Request 1 - Bliski adres:**
```bash
curl -X POST https://api.sandbox.furgonetka.pl/ENDPOINT_KALKULACJI \
  -H "Authorization: Bearer TWOJ_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {
      "postcode": "00-533",
      "city": "Warszawa",
      "country": "PL"
    },
    "receiver": {
      "postcode": "00-001",
      "city": "Warszawa",
      "country": "PL"
    },
    "package": {
      "length": 15,
      "width": 15,
      "height": 15,
      "weight": 1.5
    }
  }'
```

**Request 2 - Średni adres:**
```bash
curl -X POST https://api.sandbox.furgonetka.pl/ENDPOINT_KALKULACJI \
  -H "Authorization: Bearer TWOJ_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {
      "postcode": "00-533",
      "city": "Warszawa",
      "country": "PL"
    },
    "receiver": {
      "postcode": "03-100",
      "city": "Warszawa Praga",
      "country": "PL"
    },
    "package": {
      "length": 15,
      "width": 15,
      "height": 15,
      "weight": 1.5
    }
  }'
```

**Request 3 - Daleki adres:**
```bash
curl -X POST https://api.sandbox.furgonetka.pl/ENDPOINT_KALKULACJI \
  -H "Authorization: Bearer TWOJ_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {
      "postcode": "00-533",
      "city": "Warszawa",
      "country": "PL"
    },
    "receiver": {
      "postcode": "30-001",
      "city": "Kraków",
      "country": "PL"
    },
    "package": {
      "length": 15,
      "width": 15,
      "height": 15,
      "weight": 1.5
    }
  }'
```

### 5.3 Zapisz wszystkie odpowiedzi
Zapisz JSON response z każdego requestu do pliku:
- `response-close.json`
- `response-medium.json`
- `response-far.json`

---

## Krok 6: Weryfikacja Distance-Based Variation

### 6.1 Sprawdź stawki
Porównaj `price` lub `gross_price` z trzech odpowiedzi:
- **Bliski:** Najniższa stawka?
- **Średni:** Średnia stawka?
- **Daleki:** Najwyższa stawka?

### 6.2 Sprawdź terminy dostawy
Jeśli response zawiera `delivery_time` lub `estimated_delivery`:
- **Bliski:** Najkrótszy termin?
- **Średni:** Średni termin?
- **Daleki:** Najdłuższy termin?

### 6.3 Sprawdź czy dane są realne
- Czy stawki wyglądają na realne (np. 15-30 PLN dla lokalnej, 25-45 PLN dla dalekiej)?
- Czy terminy są realistyczne (np. 1 dzień dla lokalnej, 2-3 dni dla dalekiej)?
- Czy dane różnią się między requestami (nie są identyczne)?

---

## Krok 7: Dokumentacja Wyników

### 7.1 Utwórz raport testu
Utwórz plik `furgonetka-test-results.md` z:

```markdown
# Furgonetka Sandbox API Test Results

**Data:** 2026-05-14
**Test Endpoint:** [URL endpoint]

## Wyniki Kalkulacji Ceny

| Adres | Kod pocztowy | Stawka (PLN) | Termin dostawy |
|-------|--------------|--------------|----------------|
| Bliski (Warszawa) | 00-001 | [wartość] | [wartość] |
| Średni (Warszawa Praga) | 03-100 | [wartość] | [wartość] |
| Daleki (Kraków) | 30-001 | [wartość] | [wartość] |

## Weryfikacja Kontraktu

- ✅/❌ Stawki rosną z odległością
- ✅/❌ Terminy rosną z odległością
- ✅/❌ Dane są realne (nie testowe)
- ✅/❌ Terminy dostawy są dostępne

## Conclusion

[Furgonetka spełnia/nie spełnia kontrakt]
```

---

## Checklist Testu

- [ ] Konto zarejestrowane
- [ ] OAuth app utworzony
- [ ] Client ID i Client Secret zapisane
- [ ] Access token uzyskany
- [ ] Dokumentacja API przeglądana
- [ ] Endpoint kalkulacji ceny zidentyfikowany
- [ ] 3 requesty wykonane
- [ ] Odpowiedzi zapisane
- [ ] Distance-based variation zweryfikowane
- [ ] Raport testu utworzony

---

## Troubleshooting

### Problem: "Unauthorized" lub "Invalid credentials"
**Rozwiązanie:** Sprawdź czy Client ID i Client Secret są poprawne. Upewnij się że używasz sandbox URL (`api.sandbox.furgonetka.pl`).

### Problem: "Invalid request" lub "Missing parameters"
**Rozwiązanie:** Sprawdź dokumentację API czy wszystkie wymagane parametry są przesłane. Format JSON musi być poprawny.

### Problem: "Sandbox returns test data"
**Oznacza:** Sandbox nie spełnia kontraktu (wymaga realnych danych). Dokumentuj to i zakończ test.

### Problem: "No delivery timeline in response"
**Oznacza:** API nie spełnia kontraktu (brak terminów dostawy). Dokumentuj to i zakończ test.

---

## Next Steps

### Jeśli test się powiedzie:
- Furgonetka spełnia kontrakt
- Można użyć do eksperymentu obliczania stawek
- Zaktualizuj dokumentację `poland-shipping-api-zero-cost-validation.md`

### Jeśli test się nie powiedzie:
- Dokumentuj dlaczego (brak realnych danych, brak terminów, brak variation)
- Zaktualizuj dokumentację `poland-shipping-api-zero-cost-validation.md`
- Rozważ inne opcje (Epaka.pl, alternatywne kraje)
