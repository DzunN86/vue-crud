import * as Yup from "yup";

const schema = Yup.object().shape({
  provider: Yup.string()
    .required("Provider wajib diisi")
    .typeError("Provider wajib diisi"),
  noHp: Yup.string()
    .min(10, "No HP minimal 10 karakter")
    .max(13, "No HP maksimal 13 karakter")
    .matches(/^[0-9]+$/, "No HP harus berupa angka")
    .required("No HP wajib diisi")
    .typeError("No HP harus berupa angka"),
  nominal: Yup.number("Nominal harus berupa angka")
    .required("Nominal wajib diisi")
    .min(10000, "Beli minimal Rp 10.000")
    .typeError("Nominal harus berupa angka"),
});

export { schema };
