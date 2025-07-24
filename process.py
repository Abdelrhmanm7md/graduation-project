# سكريبت موحّد لتحويل ملفات EEG (mat/edf/xdf) ومعالجتها والتنبؤ باستخدام نموذج ADHD مدرّب
# pip install mne
# pip install pyxdf
import os
import sys
import json
import pandas as pd
import numpy as np
import scipy.io
import mne
import pyxdf
import joblib
from sklearn.metrics import accuracy_score
from mne.preprocessing import ICA
from scipy.stats import skew, kurtosis
from scipy.signal import welch

# ---------- إعدادات ----------
CHANNEL_NAMES = [
    "Fp1", "Fp2", "F3", "F4", "C3", "C4", "P3", "P4",
    "O1", "O2", "F7", "F8", "T7", "T8", "P7", "P8",
    "Fz", "Cz", "Pz"
]
SFREQ = 128

SELECTED_FEATURES = [
    "C4_mobility", "C4_beta",
    "P4_std", "P4_max", "P4_mobility", "P4_beta", "P4_gamma",
    "O1_mobility",
    "O2_std", "O2_max", "O2_min", "O2_mobility", "O2_beta", "O2_gamma",
    "F7_std", "F7_max", "F7_min", "F7_mobility", "F7_theta", "F7_beta", "F7_alpha", "F7_delta", "F7_gamma",
    "T7_std", "T7_mobility", "T7_beta", "T7_gamma",
    "T8_std", "T8_min", "T8_mobility", "T8_beta", "T8_delta", "T8_gamma",
    "Cz_mobility", "Cz_beta",
    "Pz_std", "Pz_mobility", "Pz_beta", "Pz_gamma"
]


# ---------- 1. تحويل الملف ----------
def convert_to_csv(file_path):
    ext = file_path.split('.')[-1].lower()

    if ext == 'csv':
        df = pd.read_csv(file_path)
        for ch in CHANNEL_NAMES:
            if ch not in df.columns:
                df[ch] = 0.0  # ملء الأعمدة الناقصة بصفر
        return df[CHANNEL_NAMES[:df.shape[1]]]
    elif ext == 'mat':
        mat_data = scipy.io.loadmat(file_path)
        for _, value in mat_data.items():
            if isinstance(value, np.ndarray) and value.ndim == 2:
                df = pd.DataFrame(value.T)
                df = df.iloc[:, :len(CHANNEL_NAMES)]
                df.columns = CHANNEL_NAMES[:df.shape[1]]
                return df
        raise ValueError("لم يتم العثور على مصفوفة EEG صالحة في ملف .mat")

    elif ext == 'edf':
        raw = mne.io.read_raw_edf(file_path, preload=True)
        chs = [ch for ch in CHANNEL_NAMES if ch in raw.info['ch_names']]
        if not chs:
            raise ValueError("لا توجد قنوات مطابقة في ملف EDF")
        raw.pick_channels(chs)
        return pd.DataFrame(raw.get_data().T, columns=chs)

    elif ext == 'xdf':
        streams, _ = pyxdf.load_xdf(file_path)
        for stream in streams:
            if stream['info']['type'][0] == 'EEG':
                data = np.array(stream['time_series'])
                labels = [ch['label'][0] for ch in stream['info']['desc'][0]['channels'][0]['channel']]
                idx = [i for i, ch in enumerate(labels) if ch in CHANNEL_NAMES]
                if not idx:
                    raise ValueError("لم يتم العثور على قنوات EEG مطابقة في XDF")
                return pd.DataFrame(data[:, idx], columns=[labels[i] for i in idx])
        raise ValueError("لم يتم العثور على تدفق EEG في ملف XDF")

    else:
        raise ValueError(f"صيغة غير مدعومة: {ext}")


# ---------- 2. معالجة البيانات واستخراج الميزات ----------
def preprocess_and_extract_features(df):
    for ch in CHANNEL_NAMES:
        if ch not in df.columns:
            df[ch] = 0.0  # استكمال الأعمدة الناقصة بـ 0

    df = df[CHANNEL_NAMES]  # إعادة ترتيب الأعمدة
    raw = mne.io.RawArray(df.to_numpy().T, mne.create_info(CHANNEL_NAMES, sfreq=SFREQ, ch_types='eeg'))

    raw.filter(0.5, 63, fir_design='firwin')
    raw.notch_filter(50)
    raw.set_montage(mne.channels.make_standard_montage('standard_1020'))

    ica = ICA(n_components=min(15, raw.info['nchan']), random_state=97, max_iter=500)
    ica.fit(raw)
    raw_cleaned = ica.apply(raw.copy())
    raw_cleaned.set_eeg_reference(ref_channels='average', projection=False)
    data = raw_cleaned.get_data()

    feature_vector = []
    feature_names = []

    bands = {
        'theta': (4, 8), 'beta': (13, 30), 'alpha': (8, 13), 'delta': (0.5, 4), 'gamma': (30, 45)
    }

    for ch_idx, ch_name in enumerate(CHANNEL_NAMES):
        signal = data[ch_idx] if ch_idx < data.shape[0] else np.zeros(data.shape[1])
        signal = np.nan_to_num(signal)  # استبدال أي NaN بـ 0

        time_feat = [
            np.nan_to_num(np.mean(signal)),
            np.nan_to_num(np.std(signal)),
            np.nan_to_num(skew(signal)),
            np.nan_to_num(kurtosis(signal)),
            np.nan_to_num(np.max(signal)),
            np.nan_to_num(np.min(signal)),
            np.nan_to_num(np.mean(np.abs(np.diff(signal))))
        ]

        freqs, psd = welch(signal, fs=SFREQ, nperseg=min(256, len(signal)))
        band_feat = [np.nan_to_num(np.mean(psd[(freqs >= f[0]) & (freqs <= f[1])])) for f in bands.values()]

        theta, beta, alpha = band_feat[0], band_feat[1], band_feat[2]
        ratio_feat = [theta / beta if beta else 0, theta / alpha if alpha else 0]

        all_feat = time_feat + band_feat + ratio_feat
        feature_vector.extend(all_feat)

        feature_names.extend([
                                 f"{ch_name}_mean", f"{ch_name}_std", f"{ch_name}_skew", f"{ch_name}_kurtosis",
                                 f"{ch_name}_max", f"{ch_name}_min", f"{ch_name}_mobility"
                             ] + [f"{ch_name}_{b}" for b in bands] + [f"{ch_name}_theta_beta_ratio",
                                                                      f"{ch_name}_theta_alpha_ratio"])

    df_features = pd.DataFrame([feature_vector], columns=feature_names)

    for feat in SELECTED_FEATURES:
        if feat not in df_features.columns:
            df_features[feat] = 0.0

    df_features.fillna(0.0, inplace=True)  # التأكد من عدم وجود NaN بعد الحسابات
    return df_features[SELECTED_FEATURES]

# def predict_with_model(features_df, model_path="F:\\FCDS\\Graduation Project\\gradProject\\adhd_combined_model.pkl"):

# ---------- 3. التنبؤ باستخدام النموذج ----------
def predict_with_model(features_df, model_path="adhd_combined_model.pkl"):
    model_data = joblib.load(model_path)
    model = model_data['model']
    expected_features = model_data['feature_names']

    for feat in expected_features:
        if feat not in features_df.columns:
            features_df[feat] = 0.0

    features_df.fillna(0.0, inplace=True)  # تجنب أي NaN داخل البيانات

    X = features_df[expected_features]
    preds = model.predict(X)
    probs = model.predict_proba(X)
    return pd.DataFrame({
        'Prediction': preds,
        'Prob_0': probs[:, 0],
        'Prob_1': probs[:, 1]
    })


# ---------- 4. مثال تشغيل ----------
if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("❌ لم يتم تمرير مسار الملف")
        sys.exit(1)

    file_path = sys.argv[1]

    df = convert_to_csv(file_path)
    features = preprocess_and_extract_features(df)
    results = predict_with_model(features)
    print("###RESULT###")
    print(json.dumps(results.to_dict(orient='records')))


