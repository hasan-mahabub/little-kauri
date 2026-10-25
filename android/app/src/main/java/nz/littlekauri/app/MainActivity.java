package nz.littlekauri.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.graphics.Insets;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Locale;
import java.util.Set;

/** Hosts the Little Kauri web app from the bundled assets and gives it the phone's text to speech. */
public class MainActivity extends Activity implements TextToSpeech.OnInitListener {

    // Served over this https address so fetch, audio and local storage behave like a normal website.
    private static final String START_URL = "https://appassets.androidplatform.net/assets/www/index.html";

    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        styleSystemBars();

        tts = new TextToSpeech(this, this);

        final WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web = new WebView(this);
        web.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 35) {
                Insets safe = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            }
            return insets;
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setTextZoom(100);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assets.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !"appassets.androidplatform.net".equals(request.getUrl().getHost());
            }
        });
        // Needed so the app's confirm() prompts (reset and delete player) are shown.
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new TtsBridge(), "AndroidTTS");

        setContentView(web);
        if (savedInstanceState == null) {
            web.loadUrl(START_URL);
        } else {
            web.restoreState(savedInstanceState);
        }
    }

    private void styleSystemBars() {
        Window window = getWindow();
        window.setStatusBarColor(Color.parseColor("#FFE0F0"));
        window.setNavigationBarColor(Color.parseColor("#DCFAF1"));
        window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
    }

    @Override
    public void onInit(int status) {
        ttsReady = status == TextToSpeech.SUCCESS;
        if (!ttsReady) return;
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String id) { }

            @Override
            public void onDone(String id) { sendTtsEvent(id, "end"); }

            @Override
            public void onError(String id) { sendTtsEvent(id, "error"); }

            @Override
            public void onStop(String id, boolean interrupted) { sendTtsEvent(id, "error"); }
        });
        runOnUiThread(() -> web.evaluateJavascript("window.__ttsVoicesChanged && window.__ttsVoicesChanged()", null));
    }

    private void sendTtsEvent(String id, String type) {
        String js = "window.__ttsEvent && window.__ttsEvent(" + JSONObject.quote(id) + "," + JSONObject.quote(type) + ")";
        runOnUiThread(() -> web.evaluateJavascript(js, null));
    }

    /** The small speech API the web app calls as window.AndroidTTS. */
    private class TtsBridge {
        @JavascriptInterface
        public String voices() {
            JSONArray list = new JSONArray();
            if (!ttsReady) return list.toString();
            try {
                Set<Voice> voices = tts.getVoices();
                if (voices == null) return list.toString();
                for (Voice voice : voices) {
                    if (voice.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                    JSONObject item = new JSONObject();
                    item.put("name", voice.getName());
                    item.put("lang", voice.getLocale().toLanguageTag());
                    item.put("network", voice.isNetworkConnectionRequired());
                    item.put("quality", voice.getQuality());
                    list.put(item);
                }
            } catch (Exception ignored) {
                // Some speech engines throw while voices are still installing; an empty list is fine.
            }
            return list.toString();
        }

        @JavascriptInterface
        public void speak(String id, String text, double rate, double pitch, String voiceName, String lang) {
            if (!ttsReady) {
                sendTtsEvent(id, "error");
                return;
            }
            Voice chosen = null;
            Set<Voice> voices = tts.getVoices();
            if (voices != null && voiceName != null && !voiceName.isEmpty()) {
                for (Voice voice : voices) {
                    if (voice.getName().equals(voiceName) && !voice.isNetworkConnectionRequired()
                            && !voice.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) {
                        chosen = voice;
                        break;
                    }
                }
            }
            if (chosen == null && voices != null) {
                String requestedLanguage = lang == null ? "en" : Locale.forLanguageTag(lang).getLanguage();
                for (Voice voice : voices) {
                    if (voice.getLocale().getLanguage().equalsIgnoreCase(requestedLanguage)
                            && !voice.isNetworkConnectionRequired()
                            && !voice.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) {
                        chosen = voice;
                        break;
                    }
                }
                if (chosen == null) {
                    for (Voice voice : voices) {
                        if (voice.getLocale().getLanguage().equalsIgnoreCase("en")
                                && !voice.isNetworkConnectionRequired()
                                && !voice.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) {
                            chosen = voice;
                            break;
                        }
                    }
                }
            }
            if (chosen == null) {
                sendTtsEvent(id, "error");
                return;
            }
            tts.setVoice(chosen);
            tts.setSpeechRate((float) rate);
            tts.setPitch((float) pitch);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id);
        }

        @JavascriptInterface
        public void stop() {
            if (ttsReady) tts.stop();
        }

        @JavascriptInterface
        public void openSettings() {
            runOnUiThread(() -> {
                Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                if (intent.resolveActivity(getPackageManager()) != null) startActivity(intent);
            });
        }

        @JavascriptInterface
        public void installVoiceData() {
            runOnUiThread(() -> {
                Intent intent = new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
                String engine = tts == null ? null : tts.getDefaultEngine();
                if (engine != null) intent.setPackage(engine);
                if (intent.resolveActivity(getPackageManager()) != null) {
                    startActivity(intent);
                } else {
                    startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
                }
            });
        }
    }

    // Back goes to the app's own Back button when there is one, otherwise it closes the app.
    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        web.evaluateJavascript(
                "(function(){var b=document.querySelector('button[aria-label=\"Back\"]');if(b){b.click();return true;}return false;})()",
                result -> {
                    if ("true".equals(result)) return;
                    if (web.canGoBack()) web.goBack();
                    else finish();
                });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (ttsReady) tts.stop();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.onResume();
            web.postDelayed(() -> web.evaluateJavascript(
                    "window.__ttsVoicesChanged && window.__ttsVoicesChanged()", null), 300);
        }
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }
}
