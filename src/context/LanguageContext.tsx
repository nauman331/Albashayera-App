import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager, Alert, DevSettings } from "react-native";

type Language = "en" | "ar";
type Direction = "ltr" | "rtl";
type LanguageContextType = {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    direction: "ltr",
    setLanguage: () => { },
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>("en");
    const [direction, setDirection] = useState<Direction>("ltr");

    useEffect(() => {
        AsyncStorage.getItem("@language").then((lang) => {
            if (lang === "ar" || lang === "en") {
                setLanguageState(lang);
                i18n.changeLanguage(lang);
                setLayoutDirection(lang, false);
            }
        });
    }, []);

    const setLayoutDirection = async (lang: Language, showAlert = true) => {
        const isRTL = lang === "ar";
        setDirection(isRTL ? "rtl" : "ltr");
        if (I18nManager.isRTL !== isRTL) {
            await I18nManager.forceRTL(isRTL);
            if (showAlert) {
                Alert.alert(
                    isRTL ? "تم تغيير اللغة" : "Language Changed",
                    isRTL
                        ? "يرجى إعادة تشغيل التطبيق لتطبيق اتجاه اللغة العربية."
                        : "Please restart the app to apply the language direction.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                // Reload the app after direction change
                                try {
                                    DevSettings.reload();
                                } catch (e) {
                                    // fallback: do nothing
                                }
                            }
                        }
                    ]
                );
            } else {
                // If no alert, reload immediately (e.g. on first load)
                try {
                    DevSettings.reload();
                } catch (e) {
                    // fallback: do nothing
                }
            }
        }
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        i18n.changeLanguage(lang);
        AsyncStorage.setItem("@language", lang);
        setLayoutDirection(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, direction, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
