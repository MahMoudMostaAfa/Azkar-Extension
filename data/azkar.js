// ===== Azkar Database =====
// Each dhikr includes: Arabic text, transliteration, translation (English),
// source (Hadith reference), category, repetition count, and audio file reference.

export const AZKAR_DATA = {
  // ==================== Morning Azkar ====================
  morning: [
    {
      id: "m1",
      arabic:
        "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
      transliteration:
        "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa AAala kulli shayin qadeer. Rabbi as-aluka khayra ma fee hathal-yawm, wa khayra ma baAAdahu, wa aAAoothu bika min sharri ma fee hathal-yawm, wa sharri ma baAAdahu. Rabbi aAAoothu bika minal-kasal, wasoo-il kibar. Rabbi aAAoothu bika min AAathabin fin-nar, wa AAathabin fil-qabr.",
      translation:
        "We have reached the morning and at this very time unto Allah belongs all sovereignty. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it and I take refuge in You from the evil of this day and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Hellfire and punishment in the grave.",
      source: "صحيح مسلم ٢٧٢٣",
      times: 1,
      category: "morning",
    },
    {
      id: "m2",
      arabic:
        "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
      transliteration:
        "Allahumma bika asbahna, wabika amsayna, wabika nahya, wabika namootu wa-ilaykan-nushoor.",
      translation:
        "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.",
      source: "سنن الترمذي ٣٣٩١",
      times: 1,
      category: "morning",
    },
    {
      id: "m3",
      arabic:
        "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
      transliteration:
        "Allahumma anta rabbee la ilaha illa ant, khalaqtanee wa-ana AAabduk, wa-ana AAala AAahdika wawaAAdika mas-tataAAtu, aAAoothu bika min sharri ma sanaAAtu, aboo-o laka biniAAmatika AAalay, wa-aboo-o bithanbee, faghfir lee fa-innahu la yaghfiruth-thunooba illa ant.",
      translation:
        "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I have committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
      source: "صحيح البخاري ٦٣٠٦ - سيد الاستغفار",
      times: 1,
      category: "morning",
    },
    {
      id: "m4",
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      transliteration: "SubhanAllahi wa bihamdihi.",
      translation: "How perfect Allah is and I praise Him.",
      source: "صحيح مسلم ٢٦٩٢",
      times: 100,
      category: "morning",
    },
    {
      id: "m5",
      arabic:
        "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      transliteration:
        "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa AAala kulli shayin qadeer.",
      translation:
        "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.",
      source: "صحيح البخاري ٦٤٠٣",
      times: 10,
      category: "morning",
    },
    {
      id: "m6",
      arabic:
        "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      transliteration:
        "Bismillahil-lathee la yadurru maAAas-mihi shay-on fil-ardi wala fis-sama-i wahuwas-sameeAAul-AAaleem.",
      translation:
        "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Seeing, The All-Knowing.",
      source: "سنن أبي داود ٥٠٨٨",
      times: 3,
      category: "morning",
    },
    {
      id: "m7",
      arabic:
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
      transliteration:
        "Allahumma innee as-alukal-AAafiyata fid-dunya wal-akhirah. Allahumma innee as-alukal-AAafwa wal-AAafiyata fee deenee wa dunyaya wa ahlee wa malee. Allahum-mastur AAawratee, wa amin rawAAatee. Allahum-mahfathnee min bayni yadayya, wa min khalfee, wa AAan yameenee, wa AAan shimalee, wa min fawqee, wa aAAoothu biAAathamatika an oghtala min tahtee.",
      translation:
        "O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth. O Allah, veil my weaknesses and set at ease my dismay. O Allah, preserve me from the front and from behind and on my right and on my left and from above, and I take refuge in Your greatness from being unexpectedly destroyed from beneath me.",
      source: "سنن أبي داود ٥٠٧٤",
      times: 1,
      category: "morning",
    },
    {
      id: "m8",
      arabic:
        "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
      transliteration:
        "Ya Hayyu ya Qayyoomu birahmatika astagheethu aslih lee sha-nee kullahu wala takilnee ila nafsee tarfata AAayn.",
      translation:
        "O Ever Living, O Self-Subsisting and Supporter of all, by Your mercy I seek assistance, rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.",
      source: "صحيح الترغيب والترهيب ١/٢٧٣",
      times: 1,
      category: "morning",
    },
    {
      id: "m9",
      arabic:
        "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
      transliteration:
        "Asbahna AAala fitratil-Islam, wa AAala kalimatil-ikhlas, wa AAala deeni nabiyyina Muhammadin ﷺ, wa AAala millati abeena Ibraheema haneefan musliman wama kana minal-mushrikeen.",
      translation:
        "We rise upon the fitrah of Islam, and the word of pure faith, and upon the religion of our Prophet Muhammad ﷺ, and the religion of our forefather Ibrahim, who was a Muslim and of true faith and was not of those who associate others with Allah.",
      source: "مسند أحمد ٣/٤٠٦",
      times: 1,
      category: "morning",
    },
    {
      id: "m10",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      transliteration:
        "AAAoothu bikalimatil-lahit-tammati min sharri ma khalaq.",
      translation:
        "I take refuge in Allah's perfect words from the evil He has created.",
      source: "صحيح مسلم ٢٧٠٩",
      times: 3,
      category: "morning",
    },
  ],

  // ==================== Evening Azkar ====================
  evening: [
    {
      id: "e1",
      arabic:
        "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
      transliteration:
        "Amsayna wa-amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa AAala kulli shayin qadeer. Rabbi as-aluka khayra ma fee hathihil-laylah, wa khayra ma baAAdaha, wa aAAoothu bika min sharri ma fee hathihil-laylah, wa sharri ma baAAdaha. Rabbi aAAoothu bika minal-kasal, wasoo-il kibar. Rabbi aAAoothu bika min AAathabin fin-nar, wa AAathabin fil-qabr.",
      translation:
        "We have reached the evening and at this very time unto Allah belongs all sovereignty. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this night and the good of what follows it and I take refuge in You from the evil of this night and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Hellfire and punishment in the grave.",
      source: "صحيح مسلم ٢٧٢٣",
      times: 1,
      category: "evening",
    },
    {
      id: "e2",
      arabic:
        "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
      transliteration:
        "Allahumma bika amsayna, wabika asbahna, wabika nahya, wabika namootu wa-ilaykal-maseer.",
      translation:
        "O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.",
      source: "سنن الترمذي ٣٣٩١",
      times: 1,
      category: "evening",
    },
    {
      id: "e3",
      arabic:
        "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
      transliteration:
        "Allahumma anta rabbee la ilaha illa ant, khalaqtanee wa-ana AAabduk, wa-ana AAala AAahdika wawaAAdika mas-tataAAtu, aAAoothu bika min sharri ma sanaAAtu, aboo-o laka biniAAmatika AAalay, wa-aboo-o bithanbee, faghfir lee fa-innahu la yaghfiruth-thunooba illa ant.",
      translation:
        "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
      source: "صحيح البخاري ٦٣٠٦ - سيد الاستغفار",
      times: 1,
      category: "evening",
    },
    {
      id: "e4",
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      transliteration: "SubhanAllahi wa bihamdihi.",
      translation: "How perfect Allah is and I praise Him.",
      source: "صحيح مسلم ٢٦٩٢",
      times: 100,
      category: "evening",
    },
    {
      id: "e5",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      transliteration:
        "AAAoothu bikalimatil-lahit-tammati min sharri ma khalaq.",
      translation:
        "I take refuge in Allah's perfect words from the evil He has created.",
      source: "صحيح مسلم ٢٧٠٩",
      times: 3,
      category: "evening",
    },
    {
      id: "e6",
      arabic:
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
      transliteration:
        "Allahumma innee as-alukal-AAafiyata fid-dunya wal-akhirah...",
      translation:
        "O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth. O Allah, veil my weaknesses and set at ease my dismay. O Allah, preserve me from the front and from behind and on my right and on my left and from above, and I take refuge in Your greatness from being unexpectedly destroyed from beneath me.",
      source: "سنن أبي داود ٥٠٧٤",
      times: 1,
      category: "evening",
    },
    {
      id: "e7",
      arabic:
        "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      transliteration:
        "Bismillahil-lathee la yadurru maAAas-mihi shay-on fil-ardi wala fis-sama-i wahuwas-sameeAAul-AAaleem.",
      translation:
        "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Seeing, The All-Knowing.",
      source: "سنن أبي داود ٥٠٨٨",
      times: 3,
      category: "evening",
    },
    {
      id: "e8",
      arabic:
        "أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
      transliteration:
        "Amsayna AAala fitratil-Islam, wa AAala kalimatil-ikhlas, wa AAala deeni nabiyyina Muhammadin ﷺ, wa AAala millati abeena Ibraheema haneefan musliman wama kana minal-mushrikeen.",
      translation:
        "We end the day upon the fitrah of Islam, and the word of pure faith, and upon the religion of our Prophet Muhammad ﷺ, and the religion of our forefather Ibrahim, who was a Muslim and of true faith and was not of those who associate others with Allah.",
      source: "مسند أحمد ٣/٤٠٦",
      times: 1,
      category: "evening",
    },
  ],

  // ==================== After Prayer Azkar ====================
  afterPrayer: [
    {
      id: "p1",
      arabic: "أَسْتَغْفِرُ اللَّهَ",
      transliteration: "Astaghfirullah.",
      translation: "I ask Allah for forgiveness.",
      source: "صحيح مسلم ٥٩١",
      times: 3,
      category: "afterPrayer",
    },
    {
      id: "p2",
      arabic:
        "اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالْإِكْرَامِ",
      transliteration:
        "Allahumma antas-salam, waminkas-salam, tabarakta ya thal-jalali wal-ikram.",
      translation:
        "O Allah, You are As-Salam and from You is all peace, blessed are You, O Possessor of majesty and honour.",
      source: "صحيح مسلم ٥٩٢",
      times: 1,
      category: "afterPrayer",
    },
    {
      id: "p3",
      arabic: "سُبْحَانَ اللَّهِ",
      transliteration: "SubhanAllah.",
      translation: "How perfect Allah is.",
      source: "صحيح مسلم ٥٩٥",
      times: 33,
      category: "afterPrayer",
    },
    {
      id: "p4",
      arabic: "الْحَمْدُ لِلَّهِ",
      transliteration: "Alhamdulillah.",
      translation: "All praise is for Allah.",
      source: "صحيح مسلم ٥٩٥",
      times: 33,
      category: "afterPrayer",
    },
    {
      id: "p5",
      arabic: "اللَّهُ أَكْبَرُ",
      transliteration: "Allahu Akbar.",
      translation: "Allah is the greatest.",
      source: "صحيح مسلم ٥٩٥",
      times: 33,
      category: "afterPrayer",
    },
    {
      id: "p6",
      arabic:
        "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      transliteration:
        "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa AAala kulli shayin qadeer.",
      translation:
        "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.",
      source: "صحيح مسلم ٥٩٣",
      times: 1,
      category: "afterPrayer",
    },
    {
      id: "p7",
      arabic:
        "آية الكرسي: اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلاَّ بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      transliteration:
        "Allahu la ilaha illa huwal-hayyul-qayyoom, la ta-khuthuhu sinatun wala nawm, lahu ma fis-samawati wama fil-ard...",
      translation:
        "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth...",
      source: "سورة البقرة ٢٥٥ - النسائي",
      times: 1,
      category: "afterPrayer",
    },
  ],

  // ==================== Sleep Azkar ====================
  sleep: [
    {
      id: "s1",
      arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
      transliteration: "Bismika Allahumma amootu wa-ahya.",
      translation: "In Your name O Allah, I live and die.",
      source: "صحيح البخاري ٦٣٢٤",
      times: 1,
      category: "sleep",
    },
    {
      id: "s2",
      arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
      transliteration: "Allahumma qinee AAathabaka yawma tabAAathu AAibadak.",
      translation:
        "O Allah, protect me from Your punishment on the day Your servants are resurrected.",
      source: "سنن أبي داود ٥٠٤٥",
      times: 1,
      category: "sleep",
    },
    {
      id: "s3",
      arabic: "اللَّهُمَّ بِاسْمِكَ أَحْيَا وَبِاسْمِكَ أَمُوتُ",
      transliteration: "Allahumma bismika ahya wa bismika amoot.",
      translation: "O Allah, in Your name I live and in Your name I die.",
      source: "صحيح البخاري ٦٣٢٥",
      times: 1,
      category: "sleep",
    },
    {
      id: "s4",
      arabic:
        "سُبْحَانَ اللَّهِ (٣٣ مرة) - الحَمْدُ لِلَّهِ (٣٣ مرة) - اللَّهُ أَكْبَرُ (٣٤ مرة)",
      transliteration:
        "SubhanAllah (33 times), Alhamdulillah (33 times), Allahu Akbar (34 times).",
      translation:
        "Glory be to Allah (33 times), Praise be to Allah (33 times), Allah is the Greatest (34 times).",
      source: "صحيح البخاري ٥٣٦٢",
      times: 1,
      category: "sleep",
    },
  ],

  // ==================== Forgiveness Azkar ====================
  forgiveness: [
    {
      id: "f1",
      arabic:
        "أَسْتَغْفِرُ اللَّهَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
      transliteration:
        "Astaghfirullaha allathee la ilaha illa huwal-hayyul-qayyoomu wa-atoobu ilayh.",
      translation:
        "I ask Allah for forgiveness, the One whom there is no deity worthy of worship except He, the Ever-Living, the Sustainer, and I repent to Him.",
      source: "سنن أبي داود ١٥١٧",
      times: 3,
      category: "forgiveness",
    },
    {
      id: "f2",
      arabic:
        "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الْغَفُورُ",
      transliteration:
        "Rabbighfir lee wa tub AAalayya innaka antat-tawwabul-ghafoor.",
      translation:
        "My Lord, forgive me and accept my repentance, You are the Ever-Relenting, the All-Forgiving.",
      source: "سنن أبي داود ١٥١٦",
      times: 100,
      category: "forgiveness",
    },
    {
      id: "f3",
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
      transliteration: "SubhanAllahi wa bihamdihi, SubhanAllahil-AAatheem.",
      translation:
        "How perfect Allah is and I praise Him. How perfect Allah is, The Supreme.",
      source: "صحيح البخاري ٦٤٠٦",
      times: 10,
      category: "forgiveness",
    },
  ],

  // ==================== Protection Azkar ====================
  protection: [
    {
      id: "pr1",
      arabic:
        "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      transliteration:
        "Bismillahil-lathee la yadurru maAAas-mihi shay-on fil-ardi wala fis-sama-i wahuwas-sameeAAul-AAaleem.",
      translation:
        "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Seeing, The All-Knowing.",
      source: "سنن أبي داود ٥٠٨٨",
      times: 3,
      category: "protection",
    },
    {
      id: "pr2",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      transliteration:
        "AAAoothu bikalimatil-lahit-tammati min sharri ma khalaq.",
      translation:
        "I take refuge in Allah's perfect words from the evil He has created.",
      source: "صحيح مسلم ٢٧٠٩",
      times: 3,
      category: "protection",
    },
    {
      id: "pr3",
      arabic:
        "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لاَمَّةٍ",
      transliteration:
        "UAAeethu bikalimatil-lahit-tammati min kulli shaytanin wa hammah, wa min kulli AAaynin lammah.",
      translation:
        "I seek refuge in the perfect words of Allah from every devil and poisonous creature and from every envious evil eye.",
      source: "صحيح البخاري ٣٣٧١",
      times: 1,
      category: "protection",
    },
  ],

  // ==================== General Dhikr ====================
  general: [
    {
      id: "g1",
      arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ",
      transliteration: "La ilaha illAllah.",
      translation: "None has the right to be worshipped except Allah.",
      source: "صحيح البخاري ٦٤٠٣",
      times: 100,
      category: "general",
    },
    {
      id: "g2",
      arabic: "سُبْحَانَ اللَّهِ",
      transliteration: "SubhanAllah.",
      translation: "How perfect Allah is.",
      source: "صحيح مسلم ٢٦٩٤",
      times: 100,
      category: "general",
    },
    {
      id: "g3",
      arabic: "الْحَمْدُ لِلَّهِ",
      transliteration: "Alhamdulillah.",
      translation: "All praise is for Allah.",
      source: "صحيح مسلم ٢٦٩٤",
      times: 100,
      category: "general",
    },
    {
      id: "g4",
      arabic: "اللَّهُ أَكْبَرُ",
      transliteration: "Allahu Akbar.",
      translation: "Allah is the greatest.",
      source: "صحيح مسلم ٢٦٩٤",
      times: 100,
      category: "general",
    },
    {
      id: "g5",
      arabic: "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ",
      transliteration: "La hawla wala quwwata illa billah.",
      translation: "There is no might nor power except with Allah.",
      source: "صحيح البخاري ٤٢٠٥",
      times: 100,
      category: "general",
    },
    {
      id: "g6",
      arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
      transliteration: "Allahumma salli wa sallim AAala nabiyyina Muhammad.",
      translation: "O Allah, send prayers and peace upon our Prophet Muhammad.",
      source: "صحيح مسلم ٣٨٤",
      times: 10,
      category: "general",
    },
  ],

  // ==================== Dua (Supplications) ====================
  dua: [
    {
      id: "d1",
      arabic:
        "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      transliteration:
        "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina AAathaban-nar.",
      translation:
        "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
      source: "سورة البقرة ٢٠١",
      times: 1,
      category: "dua",
    },
    {
      id: "d2",
      arabic: "رَبِّ زِدْنِي عِلْمًا",
      transliteration: "Rabbi zidnee AAilma.",
      translation: "My Lord, increase me in knowledge.",
      source: "سورة طه ١١٤",
      times: 1,
      category: "dua",
    },
    {
      id: "d3",
      arabic:
        "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
      transliteration:
        "Allahumma innee aAAoothu bika minal-hammi wal-hazan, wa aAAoothu bika minal-AAajzi wal-kasal, wa aAAoothu bika minal-jubni wal-bukhl, wa aAAoothu bika min ghalabatid-dayni wa qahrir-rijal.",
      translation:
        "O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
      source: "صحيح البخاري ٦٣٦٣",
      times: 1,
      category: "dua",
    },
  ],

  // ==================== Travel Azkar ====================
  travel: [
    {
      id: "t1",
      arabic:
        "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
      transliteration:
        "Allahu akbar, Allahu akbar, Allahu akbar, subhanal-lathee sakhkhara lana hatha wama kunna lahu muqrineen, wa inna ila rabbina lamunqaliboon.",
      translation:
        "Allah is the greatest, Allah is the greatest, Allah is the greatest, how perfect He is, The One Who has placed this (transport) at our service and we ourselves would not have been capable of that, and to our Lord is our final destiny.",
      source: "سورة الزخرف ١٣-١٤",
      times: 1,
      category: "travel",
    },
    {
      id: "t2",
      arabic:
        "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ",
      transliteration:
        "Allahumma inna nas-aluka fee safarina hatha albirra wattaqwa, waminal-AAamali ma tarda. Allahumma hawwin AAalayna safarana hatha watwi AAanna buAAdah.",
      translation:
        "O Allah, we ask You for righteousness and piety in this journey of ours, and we ask You for deeds which please You. O Allah, facilitate our journey and let us cover its distance quickly.",
      source: "صحيح مسلم ١٣٤٢",
      times: 1,
      category: "travel",
    },
  ],

  // ==================== Food Azkar ====================
  food: [
    {
      id: "fd1",
      arabic: "بِسْمِ اللَّهِ",
      transliteration: "Bismillah.",
      translation: "In the name of Allah.",
      source: "صحيح البخاري ٥٣٧٦",
      times: 1,
      category: "food",
    },
    {
      id: "fd2",
      arabic:
        "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ",
      transliteration:
        "Alhamdu lillahil-lathee atAAamanee hatha, wa razaqaneehi, min ghayri hawlin minnee wala quwwah.",
      translation:
        "All praise is for Allah who fed me this and provided it for me without any might or power from myself.",
      source: "سنن أبي داود ٤٠٢٣",
      times: 1,
      category: "food",
    },
  ],
};

// Category metadata
export const AZKAR_CATEGORIES = {
  morning: {
    id: "morning",
    nameAr: "أذكار الصباح",
    nameEn: "Morning Azkar",
    icon: "☀️",
    description: "Azkar to be recited in the morning after Fajr prayer",
    color: "#FF9800",
  },
  evening: {
    id: "evening",
    nameAr: "أذكار المساء",
    nameEn: "Evening Azkar",
    icon: "🌙",
    description: "Azkar to be recited in the evening after Asr prayer",
    color: "#3F51B5",
  },
  afterPrayer: {
    id: "afterPrayer",
    nameAr: "أذكار بعد الصلاة",
    nameEn: "After Prayer Azkar",
    icon: "🕌",
    description: "Azkar to be recited after each obligatory prayer",
    color: "#4CAF50",
  },
  sleep: {
    id: "sleep",
    nameAr: "أذكار النوم",
    nameEn: "Sleep Azkar",
    icon: "🌜",
    description: "Azkar to be recited before sleeping",
    color: "#1A237E",
  },
  forgiveness: {
    id: "forgiveness",
    nameAr: "أذكار الاستغفار",
    nameEn: "Seeking Forgiveness",
    icon: "🤲",
    description: "Azkar for seeking forgiveness from Allah",
    color: "#009688",
  },
  protection: {
    id: "protection",
    nameAr: "أذكار الحماية",
    nameEn: "Protection Azkar",
    icon: "🛡️",
    description: "Azkar for seeking protection from Allah",
    color: "#F44336",
  },
  general: {
    id: "general",
    nameAr: "أذكار عامة",
    nameEn: "General Dhikr",
    icon: "📿",
    description: "General remembrance of Allah",
    color: "#795548",
  },
  dua: {
    id: "dua",
    nameAr: "أدعية",
    nameEn: "Supplications (Dua)",
    icon: "🕊️",
    description: "Various supplications from Quran and Sunnah",
    color: "#E91E63",
  },
  travel: {
    id: "travel",
    nameAr: "أذكار السفر",
    nameEn: "Travel Azkar",
    icon: "✈️",
    description: "Azkar to be recited when traveling",
    color: "#00BCD4",
  },
  food: {
    id: "food",
    nameAr: "أذكار الطعام",
    nameEn: "Food Azkar",
    icon: "🍽️",
    description: "Azkar to be recited before and after eating",
    color: "#8BC34A",
  },
};
