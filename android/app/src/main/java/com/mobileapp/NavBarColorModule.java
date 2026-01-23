package com.mobileapp;

import android.app.Activity;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import androidx.appcompat.app.AppCompatDelegate;

public class NavBarColorModule extends ReactContextBaseJavaModule {
    public NavBarColorModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NavBarColor";
    }

    @ReactMethod
    public void setBackgroundColor(final String colorHex, final boolean light) {
        final Activity activity = getCurrentActivity();
        if (activity == null) {
            return;
        }

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Window window = activity.getWindow();
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        window.setNavigationBarColor(Color.parseColor(colorHex));

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            View decorView = window.getDecorView();
                            int flags = decorView.getSystemUiVisibility();
                            if (light) {
                                flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                            } else {
                                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                            }
                            decorView.setSystemUiVisibility(flags);
                        }
                    }
                } catch (Exception e) {
                    // Ignore errors
                }
            }
        });
    }

    @ReactMethod
    public void setNightMode(final boolean isDark) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (isDark) {
                    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
                } else {
                    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
                }
            }
        });
    }
}
