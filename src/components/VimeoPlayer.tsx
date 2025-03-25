import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const VimeoPlayer = () => {
  return (
    <View style={{ flex: 1,  width: "100%", height: 200, borderWidth: 2, marginBottom: 10 }}>
      <WebView
        source={{ html: `
          <iframe 
            src="https://vimeo.com/event/4922448/embed" 
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
