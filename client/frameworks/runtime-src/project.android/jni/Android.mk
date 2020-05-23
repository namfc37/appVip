LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

ifeq ($(USE_ARM_MODE),1)
LOCAL_ARM_MODE := arm
endif


LOCAL_SRC_FILES := \
../../Classes/AppDelegate.cpp \
../../Classes/ui/PopupDialog.cpp \
../../Classes/update/AssetUpdate.cpp \
../../Classes/update/Localization.cpp \
../../Classes/update/ScreenUpdateAssets.cpp \
../../Classes/ide-support/SimpleConfigParser.cpp \
../../Classes/ide-support/RuntimeJsImpl.cpp \
hellojavascript/main.cpp

LOCAL_CXXFLAGS += -fexceptions

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../Classes
LOCAL_STATIC_LIBRARIES := cocos2d_js_static jsb_pluginx_static android_native_app_glue

include $(BUILD_SHARED_LIBRARY)

$(call import-module,scripting/js-bindings/proj.android/prebuilt-mk)
$(call import-module,plugin/jsbindings/prebuilt-mk)
$(call import-module,android/native_app_glue)

