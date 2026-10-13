# Final copy and four numbered skills

User approved the zoom through the А in “ваше” and requested only finishing corrections. Removed the “01 /” prefix from the psychological-pressure label. Centered “Вместе мы научимся” and removed its right-hand “От понимания к действию” caption.

Restored four separate skills with numbers 01, 02, 03 and 04: “Распознавать”, “Дистанцироваться”, “Возвращать себе контроль” and “Нейтрализовать давление”. Recognition's explanation is now “Вы будете замечать, что на вас давят.” Preserved scanning, distancing and assembly animations; the fourth skill reveals its lines vertically. Scroll distance is 1050 px desktop / 850 px mobile.

Moved “место для вашего решения” out of the absolute frame decoration into a dedicated flow row below the stage. This guarantees separation from the active skill rather than relying on the frame's lower edge. As before, this decorative caption is omitted on mobile. Kept the rest of the page and the letter-zoom transition.

Updated skills-story.cjs for four readable beats, centered heading and at least 20 px of separation between the active explanatory text and the lower caption. It failed against the three-step version, then passed for desktop, short desktop, 2560×1440 and mobile down to 320×600. Inspected screenshots for 01 and 04. JS syntax and HTML nesting passed. All seven project browser scripts passed, including the unchanged pressure hook and letter zoom, program layout, UI interactions and BFCache. Local user preview reloaded.

Follow-up spacing and copy correction: step 02 now says “Пауза поможет выбрать комфортную дистанцию.”, step 03 “Вы будете слышать себя и выбирать свой ответ.”, and step 04 is “Нейтрализовывать давление” with “Вы сможете действовать по-своему.” The centered introductory heading remains unchanged.

Added a regression check at intermediate viewport heights and transitional frames. It reproduced a 31 px gap above the lower caption at 1440×720. The caption now has a separate 60 px top margin; number and headline sizes adapt to viewport height as well as width, with compact spacing below 850 px height. Outgoing recognition/control text moves horizontally instead of approaching the number above. Both skills-story.cjs and skills-spacing.cjs pass, including 1440×720, 1280×650, 1024×600, 564×762 and 320×600. Visually inspected updated desktop steps 02/04 and mobile step 03.

Follow-up verification also passed design-smoke.cjs, editorial-flow.cjs, JavaScript syntax and whitespace checks. Reloaded the user's local preview and confirmed all four updated skill texts in its rendered DOM.
