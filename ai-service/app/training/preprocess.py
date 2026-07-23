import pandas as pd

def encode_labels(df, label_col):
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    df[label_col + '_encoded'] = le.fit_transform(df[label_col])
    return df, le
