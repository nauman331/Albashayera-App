import React, { useState, useEffect, use } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { backendURL } from "../utils/exports"


const VimeoPlayer = () => {
  const [vimeoLink, setVimeoLink] = useState("");
  const getVimeoLink = async () => {
    try {
      const response = await fetch(`${backendURL}/vimeo/vimeo-link`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch Vimeo link");
      const data = await response.json();
      setVimeoLink(data.url || "");
    } catch (error) {
      setVimeoLink("");
    }
  };

  useEffect(() => {
    getVimeoLink();
  }, []);

  return (
    <View style={{ flex: 1, width: "100%", height: 200, borderWidth: 2, marginBottom: 10 }}>
      <WebView
        source={{
          html: `
          <iframe 
            src=${vimeoLink} 
            width="100%" height="100%" 
            frameborder="0" allow="autoplay; fullscreen" 
            allowfullscreen>
          </iframe>
        `}}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default VimeoPlayer;
