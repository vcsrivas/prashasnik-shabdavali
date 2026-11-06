<p align="center"><img src="icons/icon-192.png" width="96" alt="पुराने सरकारी कार्यालय भवन का चित्र"></p>

# प्रशासनिक शब्दावली

**रोज़ 6 प्रशासनिक हिंदी शब्द — अंग्रेज़ी अर्थ, विषय, दिन-वार इतिहास और अंग्रेज़ी से खोज।**
*An Android app that shows 6 random administrative (Rajbhasha) Hindi words a day, each with its English meaning and category.*

## ऐप में क्या है / What the app does

- **आज के 6 शब्द** — Excel फ़ाइल के कॉलम B (हिंदी शब्द) से हर दिन 6 शब्द यादृच्छिक रूप से चुने जाते हैं, कॉलम C (अंग्रेज़ी अर्थ) और कॉलम D (विषय) के साथ, अलग-अलग शब्द-कार्ड पर। पूरी सूची पूरी होने तक कोई शब्द दोबारा नहीं आता।
  *6 random words a day from column B, with the meaning from column C and the category from column D. No word repeats until the whole list has been shown.*
- **इतिहास (दिन-वार)** — हर दिन के शब्द तारीख़ के साथ सुरक्षित रहते हैं। इतिहास में किसी शब्द को छूने पर उसका अर्थ और विषय दिखता है, ताकि आप अर्थ याद करके जाँच सकें।
  *Day-wise history: tap any past word to see its meaning and category again.*
- **खोज** — अंग्रेज़ी में लिखना शुरू करें (जैसे *appro…*), सुझाव दिखेंगे; किसी सुझाव को चुनते ही उसका हिंदी शब्द-कार्ड खुलता है। हिंदी में भी खोज सकते हैं।
  *Search in English with live suggestions; pick one to see its Hindi word card.*
- बिना इंटरनेट के चलता है। इतिहास केवल आपके फ़ोन में रहता है।
  *Works offline. History is stored only on your phone.*

## 1. GitHub पर रिपॉज़िटरी बनाएँ / Create the repository

1. GitHub पर **New repository** बनाएँ, जैसे `prashasnik-shabdavali`, और उसे **Public** रखें।
2. इस फ़ोल्डर की **सभी** फ़ाइलें अपलोड करें — छिपे फ़ोल्डर `.github` सहित (इसी में Android ऐप बनाने का निर्देश है)।
   - सबसे आसान: कंप्यूटर पर फ़ोल्डर खोलें, उसकी सारी सामग्री चुनकर GitHub के **Add file → Upload files** पृष्ठ पर खींचकर छोड़ें, फिर **Commit changes**।
   - Mac पर छिपी फ़ाइलें दिखाने के लिए Finder में `Cmd + Shift + .` दबाएँ।
   - या कमांड लाइन से:
     ```bash
     git init && git add . && git commit -m "प्रशासनिक शब्दावली"
     git branch -M main
     git remote add origin https://github.com/<your-username>/prashasnik-shabdavali.git
     git push -u origin main
     ```
3. जाँच लें कि रिपॉज़िटरी में `.github/workflows/build-android-app.yml` फ़ाइल दिख रही है।

*Create a public repository and upload everything in this folder, including the hidden `.github` folder — it contains the instructions GitHub uses to build the Android app.*

## 2. Android ऐप (APK) बनना / The APK is built automatically

फ़ाइलें अपलोड होते ही GitHub अपने-आप ऐप बनाता है:
- रिपॉज़िटरी में **Actions** टैब खोलें — "Build Android app" चलता दिखेगा (लगभग 5–8 मिनट)।
- पूरा होने पर ऐप **Releases** में दिखेगा। हमेशा नवीनतम ऐप का सीधा लिंक:

  `https://github.com/<your-username>/prashasnik-shabdavali/releases/latest/download/prashasnik-shabdavali.apk`

यदि Actions अपने-आप न चले, तो **Actions → Build Android app → Run workflow** दबाएँ।
*Open the **Actions** tab to watch the build; the APK then appears under **Releases**, and the link above always points to the newest build.*

## 3. फ़ोन पर इंस्टॉल करें / Install on the phone

1. फ़ोन के ब्राउज़र में ऊपर वाला लिंक खोलें (या रिपॉज़िटरी के **Releases** में `prashasnik-shabdavali.apk` पर टैप करें)।
2. डाउनलोड पूरा होने पर फ़ाइल खोलें और **Install** दबाएँ।
3. यदि फ़ोन पूछे, तो ब्राउज़र/Files ऐप के लिए **"Install unknown apps" (अज्ञात ऐप इंस्टॉल करें)** की अनुमति दें। Play Protect चेतावनी दिखाए, तो **More details → Install anyway** चुनें — यह Play Store के बाहर से इंस्टॉल होने वाले हर ऐप के लिए सामान्य है।

*Open the link on the phone, download the APK, open it and tap Install. Allow "Install unknown apps" if asked; Play Protect may warn because the app isn't from the Play Store — choose "Install anyway".*

**iPhone:** iPhone पर APK नहीं चलता। नीचे दिए वेबसाइट वाले तरीके से ऐप को होम स्क्रीन पर जोड़ें।

## 4. (वैकल्पिक) वेबसाइट और iPhone / Optional: website & iPhone

**Settings → Pages** में *Deploy from a branch*, ब्रांच **main**, फ़ोल्डर **/ (root)** चुनकर **Save** करें। कुछ मिनट बाद ऐप `https://<your-username>.github.io/prashasnik-shabdavali/` पर खुलेगा। वहाँ से:
- **iPhone (Safari):** Share → **Add to Home Screen**
- **Android (Chrome):** ⋮ → **Add to Home screen / Install app**
- वेबसाइट के **जानकारी** टैब में APK डाउनलोड का बटन भी अपने-आप दिखता है।

## शब्द-सूची बदलना / Updating the words

1. `Official_Hindi_Words_English_Meanings.xlsx` में बदलाव करें — **कॉलम B** हिंदी शब्द, **कॉलम C** अंग्रेज़ी अर्थ, **कॉलम D** विषय; पहली पंक्ति शीर्षक। शब्द **Glossary** शीट में हों (न हो तो पहली शीट पढ़ी जाती है)।
2. उसी नाम से GitHub पर अपलोड करें (**Add file → Upload files → Commit changes**)।
3. GitHub अपने-आप नया APK बनाएगा। उसे फ़ोन पर इंस्टॉल करें — यह पुराने ऐप के ऊपर इंस्टॉल होगा और **आपका इतिहास बना रहेगा**। वेबसाइट भी कुछ मिनट में नई सूची दिखाने लगेगी।

*Edit the spreadsheet (B = Hindi, C = English, D = category, row 1 = headings), upload it with the same name, and install the new APK that GitHub builds. It installs over the old app and keeps your history.*

## ध्यान दें / Notes

- इतिहास केवल फ़ोन में सहेजा जाता है। ऐप **अनइंस्टॉल** करने या ऐप का डेटा मिटाने पर इतिहास मिट जाएगा।
- ऐप उन्हीं दिनों का इतिहास रखता है जिन दिनों उसे खोला गया।
- `android/keystore` में ऐप पर हस्ताक्षर करने की कुंजी है, ताकि हर नया APK पुराने के ऊपर इंस्टॉल हो सके। यह सार्वजनिक रिपॉज़िटरी में है, इसलिए APK केवल अपनी ही रिपॉज़िटरी के Releases से डाउनलोड करें।
  *The signing key in `android/keystore` keeps updates installable over each other. Because it is in a public repository, only install the APK from your own repository's Releases page.*

## फ़ाइलें / Files

| फ़ाइल | काम |
|---|---|
| `Official_Hindi_Words_English_Meanings.xlsx` | शब्द-सूची (कॉलम B, C, D) |
| `index.html`, `style.css`, `app.js` | ऐप |
| `xlsx-reader.js`, `inflate.js` | Excel फ़ाइल पढ़ने का कोड (बिना किसी बाहरी लाइब्रेरी के) |
| `icons/` | ऐप का चित्र (पुराना सरकारी कार्यालय भवन) |
| `android/` | Android ऐप का ढाँचा |
| `.github/workflows/build-android-app.yml` | GitHub पर APK बनाने और Releases में डालने का निर्देश |
| `manifest.webmanifest`, `sw.js` | वेबसाइट को फ़ोन पर इंस्टॉल करने और ऑफ़लाइन चलाने के लिए |

## अस्वीकरण / Disclaimer

यद्यपि शब्दों और उनके अर्थों की शुद्धता का पूरा ध्यान रखा गया है, फिर भी यह शब्द-सूची कृत्रिम बुद्धिमत्ता (AI) की सहायता से तैयार की गई है, अतः उपयोगकर्ता अपने स्तर पर अर्थ का सत्यापन करने में उचित सावधानी बरतें।

*Although due care has been taken for the correctness of words and meanings, as the word list is made using AI, due caution is needed at the users' end to verify the meaning.*
