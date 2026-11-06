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

स्थानीय रूप से देखने के लिए `index.html` को सीधे ब्राउज़र में खोल सकते हैं।
*To try it locally, just open `index.html` in a browser.*

## शब्द सूची बदलना / Updating the word list

शब्द `data/Official_Hindi_Words_English_Meanings.xlsx` (शीट *Glossary*) में हैं। ऐप `data/words.js` पढ़ता है, जो इसी Excel फ़ाइल से बनती है। शब्द जोड़ने या सुधारने के लिए:

```bash
pip install openpyxl
python scripts/xlsx_to_words.py
```

फिर दोनों फ़ाइलें commit करें। ध्यान दें: शब्दों की संख्या बदलने पर दैनिक क्रम भी बदल जाता है।
*Edit the spreadsheet, run the script, and commit both files. Changing the number of words reshuffles the daily order.*

## फ़ाइलें / Files

| फ़ाइल | काम |
|---|---|
| `index.html` | ऐप का पृष्ठ |
| `style.css` | रूप-सज्जा (डार्क मोड सहित) |
| `app.js` | दैनिक शब्द चयन, खोज, प्रगति |
| `data/words.js` | शब्द सूची (Excel से बनी) |
| `data/Official_Hindi_Words_English_Meanings.xlsx` | मूल शब्द सूची |
| `scripts/xlsx_to_words.py` | Excel → `words.js` |
| `manifest.webmanifest`, `sw.js`, `assets/icon.svg` | इंस्टॉल और ऑफ़लाइन सुविधा |

## अस्वीकरण / Disclaimer

इस ऐप के शब्द और उनके अर्थ कृत्रिम बुद्धिमत्ता (AI) की सहायता से संकलित किए गए हैं। यद्यपि शब्दों और अर्थों की शुद्धता का ध्यान रखा गया है, फिर भी पाठकों से सावधानी अपेक्षित है। आधिकारिक प्रयोग से पहले कृपया वैज्ञानिक तथा तकनीकी शब्दावली आयोग (CSTT) की प्रशासनिक शब्दावली या संबंधित विभाग के मानक स्रोत से मिलान कर लें।

*The words and meanings in this app have been compiled using AI. Although care has been taken that the words and meanings are correct, readers' caution is necessitated. Please verify against the CSTT administrative glossary or your department's standard source before official use.*
