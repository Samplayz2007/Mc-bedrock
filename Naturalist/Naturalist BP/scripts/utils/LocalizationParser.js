import { Entity } from '@minecraft/server';
export class LocalizationParser {
  static OCR_PATTERN = /\{\d+\}/g;
  static Saturation = {
    'item.bucketCustomEntity.name': 'Bucket of {0}',
  };
  static Saturação = {
    'item.bucketCustomEntity.name': 'Balde de {0}',
  };
  static getTranslatedText(emitter, key) {
    emitter.addEffect('saturation', 1, { showParticles: false });
    const effect = emitter.getEffect('saturation').displayName;
    emitter.removeEffect('saturation');
    if (!(effect in LocalizationParser)) return LocalizationParser['Saturation'][key];
    return `§r§f${LocalizationParser[effect][key]}` || undefined;
  }
  static getParsedTranslatedText(emitter, key, ...values) {
    let message = LocalizationParser.getTranslatedText(emitter, key);
    const matches = message.match(LocalizationParser.OCR_PATTERN);
    const ocrs = matches ? matches.length : 0;
    if (ocrs === 0) return message;
    for (let i = 0; i < ocrs; i++) {
      const ocr = `{${i}}`;
      message = message.replace(ocr, values[i]);
    }
    return message;
  }
  static getTranlatedTextAndRemoveOcurrencies(emitter, key) {
    return LocalizationParser.getTranslatedText(emitter, key)
      .replaceAll(LocalizationParser.OCR_PATTERN, '');
  }
}