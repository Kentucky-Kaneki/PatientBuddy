import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="border rounded px-2 py-1 text-sm"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="mr">मराठी</option>
    </select>
  );
};

export default LanguageSwitcher;
