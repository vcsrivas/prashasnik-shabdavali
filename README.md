# प्रशासनिक शब्दावली

**हर दिन 5 राजभाषा शब्द, उनके अंग्रेज़ी अर्थ के साथ।**
*Five official (administrative) Hindi words a day, with their English meanings.*

प्रशासनिक शब्दावली सरकारी कार्यालयों में प्रयुक्त होने वाले राजभाषा (प्रशासनिक हिंदी) शब्दों को रोज़ थोड़ा-थोड़ा सीखने का एक सरल वेब ऐप है। इसमें 13 विषयों के 2,207 शब्द हैं — कार्यालय एवं प्रशासन, कार्मिक, वित्त एवं लेखा, बैंकिंग, विधि, संसद एवं निर्वाचन, आदि।

## सुविधाएँ / Features

- **रोज़ 5 शब्द-कार्ड** — हिंदी शब्द, अंग्रेज़ी अर्थ और विषय। भारतीय समयानुसार मध्यरात्रि को नए शब्द आते हैं। सभी उपयोगकर्ताओं को एक दिन में एक जैसे शब्द दिखते हैं, और पूरी सूची समाप्त होने तक कोई शब्द दोहराया नहीं जाता (लगभग 442 दिन का चक्र)।
  *5 word cards a day, the same for every visitor, changing at midnight IST; no word repeats until the whole list has been shown.*
- **अंग्रेज़ी से हिंदी खोज** — अंग्रेज़ी शब्द (जैसे *approval*, *leave*, *tender*) लिखें और उसका हिंदी पर्याय देखें। हिंदी शब्द लिखकर उसका अर्थ भी खोजा जा सकता है।
  *Type an English word to find the Hindi term; Hindi input works too. Results are ranked — exact matches first.*
- **पिछले दिनों के शब्द** — ← / → बटन से पिछले दिनों के कार्ड देखें।
- **"सीख लिया"** चिह्न और प्रगति-पट्टी (केवल आपके ब्राउज़र में सहेजी जाती है)।
- **🔊 उच्चारण** — ब्राउज़र की हिंदी आवाज़ से शब्द सुनें (जहाँ उपलब्ध हो)।
- मोबाइल पर ऐप की तरह इंस्टॉल हो सकता है और एक बार खुलने के बाद बिना इंटरनेट के भी चलता है।
- कोई सर्वर, डेटाबेस या बिल्ड-प्रक्रिया नहीं — केवल HTML, CSS और JavaScript।

## GitHub Pages पर प्रकाशित करें / Publish on GitHub Pages

1. GitHub पर एक नया रिपॉज़िटरी बनाएँ (जैसे `prashasnik-shabdavali`)।
2. इस फ़ोल्डर की सभी फ़ाइलें उसमें अपलोड करें — **Add file → Upload files**, या:
   ```bash
   git init
   git add .
   git commit -m "प्रशासनिक शब्दावली"
   git branch -M main
   git remote add origin https://github.com/<your-username>/prashasnik-shabdavali.git
   git push -u origin main
   ```
3. रिपॉज़िटरी में **Settings → Pages** खोलें। *Source* में **Deploy from a branch**, ब्रांच **main** और फ़ोल्डर **/ (root)** चुनें, फिर **Save** करें।
4. एक-दो मिनट बाद ऐप `https://<your-username>.github.io/prashasnik-shabdavali/` पर खुल जाएगा।

## शब्द सूची बदलना / Updating the words

ऐप सीधे रिपॉज़िटरी में रखी Excel फ़ाइल **`Official_Hindi_Words_English_Meanings.xlsx`** से शब्द पढ़ता है। शब्द जोड़ने, हटाने या सुधारने के लिए:

1. Excel फ़ाइल में बदलाव करें और उसे **इसी नाम** से सहेजें।
2. GitHub पर रिपॉज़िटरी खोलें → **Add file → Upload files** → फ़ाइल चुनें → **Commit changes**।
3. कुछ मिनट में ऐप नई सूची दिखाने लगेगा (GitHub Pages को अपडेट होने में 1–10 मिनट लगते हैं)।

*The app reads its words directly from the Excel file in the repository. Edit the spreadsheet, keep the same file name, and upload it to the repository (Add file → Upload files → Commit). The site picks up the new list within a few minutes — nothing else needs to change.*

**Excel फ़ाइल के नियम / Spreadsheet rules**

- शब्द **Glossary** नाम की शीट में हों; यह शीट न हो तो पहली शीट पढ़ी जाती है।
- पहली पंक्ति में शीर्षक हों। ऐप कॉलम उनके शीर्षक से पहचानता है — जिसमें **Hindi** (या हिंदी) लिखा हो, जिसमें **English** लिखा हो, और जिसमें **Category** लिखा हो। कॉलम का क्रम बदला जा सकता है और नए कॉलम जोड़े जा सकते हैं।
- एक शब्द के कई अर्थ अर्धविराम (;) से अलग करें, जैसे `Sanction; Approval`।
- खाली पंक्तियाँ और दोबारा आए हिंदी शब्द अपने-आप छोड़ दिए जाते हैं।
- शब्दों की संख्या बदलने पर दैनिक शब्दों का क्रम भी बदल जाता है।

*Words go in a sheet named "Glossary" (otherwise the first sheet). Columns are found by their headings — one containing "Hindi", one containing "English", and optionally one containing "Category" — so they can be in any order. Separate multiple meanings with semicolons. Blank rows and repeated Hindi terms are skipped. Adding or removing words reshuffles the daily order.*

**कंप्यूटर पर जाँचना / Previewing locally:** ब्राउज़र सुरक्षा कारणों से सीधे खोली गई (डबल-क्लिक) फ़ाइल से Excel नहीं पढ़ने देता। इसलिए फ़ोल्डर में यह चलाएँ और `http://localhost:8000` खोलें:
```bash
python -m http.server 8000
```
*Browsers don't allow a page opened by double-clicking to read files, so preview with a local web server as above.*

## फ़ाइलें / Files

| फ़ाइल | काम |
|---|---|
| `Official_Hindi_Words_English_Meanings.xlsx` | शब्द सूची — इसे बदलकर अपलोड करें |
| `index.html` | ऐप का पृष्ठ |
| `style.css` | रूप-सज्जा (डार्क मोड सहित) |
| `app.js` | दैनिक शब्द चयन, खोज, प्रगति |
| `xlsx-reader.js` | ब्राउज़र में Excel फ़ाइल पढ़ने वाला कोड (किसी बाहरी लाइब्रेरी के बिना) |
| `manifest.webmanifest`, `sw.js`, `assets/icon.svg` | इंस्टॉल और ऑफ़लाइन सुविधा |

## अस्वीकरण / Disclaimer

इस ऐप के शब्द और उनके अर्थ कृत्रिम बुद्धिमत्ता (AI) की सहायता से संकलित किए गए हैं। यद्यपि शब्दों और अर्थों की शुद्धता का ध्यान रखा गया है, फिर भी पाठकों से सावधानी अपेक्षित है। आधिकारिक प्रयोग से पहले कृपया वैज्ञानिक तथा तकनीकी शब्दावली आयोग (CSTT) की प्रशासनिक शब्दावली या संबंधित विभाग के मानक स्रोत से मिलान कर लें।

*The words and meanings in this app have been compiled using AI. Although care has been taken that the words and meanings are correct, readers' caution is necessitated. Please verify against the CSTT administrative glossary or your department's standard source before official use.*
