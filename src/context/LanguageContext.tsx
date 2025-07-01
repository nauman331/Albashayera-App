import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager, Alert } from "react-native";

type Language = "en" | "ar";
type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => { },
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        AsyncStorage.getItem("@language").then((lang) => {
            if (lang === "ar" || lang === "en") {
                setLanguageState(lang);
                i18n.changeLanguage(lang);
                setLayoutDirection(lang);
            }
        });
    }, []);

    const setLayoutDirection = async (lang: Language) => {
        const isRTL = lang === "ar";
        if (I18nManager.isRTL !== isRTL) {
            await I18nManager.forceRTL(isRTL);
            // Alert user to reload app for direction change
            Alert.alert(
                isRTL ? "تم تغيير اللغة" : "Language Changed",
                isRTL
                    ? "يرجى إعادة تشغيل التطبيق لتطبيق اتجاه اللغة العربية."
                    : "Please restart the app to apply the language direction.",
                [{ text: "OK", onPress: () => { } }]
            );
        }
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        i18n.changeLanguage(lang);
        AsyncStorage.setItem("@language", lang);
        setLayoutDirection(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
