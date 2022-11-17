<script setup>
import { computed, reactive, watchEffect } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/solid";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as Yup from "yup";
import moment from "moment";

const bukuMama = reactive({
  data: JSON.parse(localStorage.getItem("bukuMama") || "[]"),
  form: {
    provider: null,
    noHp: "",
    nominal: null,
    catatan: "",
    status: "",
  },
  selected: {},
  mode: "Add",
  filter: {
    provider: "",
    status: "",
    previx: null,
  },
});

const mutateBukuMama = (values, { resetForm }) => {
  alert(
    `Berhasil ${bukuMama.mode} data dengan provider ${values.provider} dan nomor ${values.noHp}`
  );

  if (bukuMama.mode === "Add") {
    bukuMama.data.unshift({
      id: Math.random(),
      provider: bukuMama.form.provider,
      noHp: bukuMama.form.noHp,
      nominal: bukuMama.form.nominal,
      date: new Date().toISOString(),
      status: "PENDING",
      catatan: bukuMama.form.catatan || "",
    });
    // Reset
    resetForm();
    initForm();
  } else {
    const index = bukuMama.data.findIndex(
      (item) => item.id === bukuMama.selected.id
    );
    bukuMama.data[index] = {
      ...bukuMama.selected,
      provider: bukuMama.form.provider,
      noHp: bukuMama.form.noHp,
      nominal: bukuMama.form.nominal,
      catatan: bukuMama.form.catatan || "",
      status: bukuMama.form.status || "PENDING",
    };
    // Reset
    resetForm();
    initForm();
  }
};

const isDark = useDark();
const toggleDark = useToggle(isDark);

const useStatus = (status) => {
  switch (status) {
    case "SUCCESS":
      return "bg-green-200 text-green-800";
    case "PENDING":
      return "bg-yellow-200 text-yellow-800";
    case "CANCELED":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

// Reset Form
const initForm = () => {
  bukuMama.form = {
    provider: null,
    noHp: "",
    nominal: null,
    catatan: "",
  };
  bukuMama.mode = "Add";
  bukuMama.selected = {};
};

// Filter Data
const filterData = computed(() => {
  return bukuMama.data.filter((item) => {
    if (bukuMama.filter.provider) {
      if (item.provider !== bukuMama.filter.provider) {
        return false;
      }
    }
    if (bukuMama.filter.status) {
      if (item.status !== bukuMama.filter.status) {
        return false;
      }
    }
    if (bukuMama.filter.previx) {
      if (!item.noHp.startsWith(bukuMama.filter.previx)) {
        return false;
      }
    }
    return true;
  });
});

// persist state
watchEffect(() => {
  localStorage.setItem("bukuMama", JSON.stringify(bukuMama.data));
});

const deleteData = (id) => {
  const index = bukuMama.data.findIndex((item) => item.id === id);
  bukuMama.data.splice(index, 1);
};

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
</script>

<template>
  <div class="mx-auto w-full px-4 py-[50px] lg:max-w-[1440px]">
    <div class="mb-16 flex justify-between">
      <div>
        <h1 class="text-4xl font-semibold mb-4 dark:text-white">
          💌 Mama Pulsa
        </h1>
        <p class="text-xl font-medium text-pink-500">Beli Pulsa</p>
      </div>
      <div @click="toggleDark()">
        <SunIcon v-if="isDark" class="w-8 h-8 text-yellow-500 cursor-pointer" />
        <MoonIcon v-else class="w-8 h-8 text-gray-900 cursor-pointer" />
      </div>
    </div>
    <div class="flex gap-6 flex-col md:flex-row">
      <div class="w-full md:w-1/3">
        <div
          class="border-2 dark:border-gray-800 rounded-lg px-6 py-6 bg-white dark:bg-gray-800/30 sticky top-10"
        >
          <h4
            class="text-xl font-semibold border-b-2 dark:text-white dark:border-gray-700 pb-4 mb-6"
          >
            📲 Beli Pulsa
          </h4>
          <Form
            class="flex flex-col gap-6"
            @submit="mutateBukuMama"
            :validation-schema="schema"
            v-slot="{ errors }"
          >
            <div class="flex flex-col">
              <label for="PROVIDER" class="form-label required">PROVIDER</label>
              <Field
                as="select"
                class="form-select"
                name="provider"
                :class="{ 'is-invalid': errors.provider }"
                aria-label="PROVIDER"
                v-model="bukuMama.form.provider"
                id="PROVIDER"
              >
                <option value="">Pilih Provider</option>
                <option value="Telkomsel">Telkomsel</option>
                <option value="IM3">IM3</option>
                <option value="3">3</option>
                <option value="Smartfren">Smartfren</option>
              </Field>
              <div class="invalid-feedback">
                <ErrorMessage name="provider" />
              </div>
            </div>
            <div class="flex flex-col">
              <label for="noHP" class="form-label required">NOMOR HP</label>
              <Field
                class="form-control"
                type="text"
                id="noHP"
                placeholder="Masukkan No.HP ..."
                v-model="bukuMama.form.noHp"
                name="noHp"
                :class="{ 'is-invalid': errors.noHp }"
              />
              <div class="invalid-feedback">
                <ErrorMessage name="noHp" />
              </div>
            </div>
            <div class="flex flex-col">
              <label for="nominal" class="form-label required">NOMIAL</label>
              <Field
                class="form-control"
                type="number"
                id="nominal"
                placeholder="Masukkan nominal..."
                name="nominal"
                v-model="bukuMama.form.nominal"
                :class="{ 'is-invalid': errors.nominal }"
              />
              <div class="invalid-feedback">
                <ErrorMessage name="nominal" />
              </div>
            </div>
            <div class="flex flex-col">
              <label for="catatan" class="form-label">CATATAN</label>
              <textarea
                class="form-control"
                id="catatan"
                rows="3"
                placeholder="Masukkan catatan..."
                v-model="bukuMama.form.catatan"
              ></textarea>
            </div>
            <div class="flex flex-col" v-if="bukuMama.mode === 'edit'">
              <label for="status" class="form-label">Status</label>
              <div class="flex gap-6">
                <div
                  class="flex gap-2 items-center font-medium dark:text-white"
                >
                  <label for="status">Selesai</label>
                  <input
                    type="radio"
                    name="status"
                    value="SUCCESS"
                    v-model="bukuMama.form.status"
                  />
                </div>
                <div
                  class="flex gap-2 items-center font-medium dark:text-white"
                >
                  <label for="status">Batalkan</label>
                  <input
                    type="radio"
                    name="status"
                    value="CANCELED"
                    v-model="bukuMama.form.status"
                  />
                </div>
              </div>
            </div>
            <div class="flex gap-2 border-t-2 pt-6 dark:border-gray-700">
              <button
                type="submit"
                :class="
                  bukuMama.mode === 'edit'
                    ? ' bg-blue-500 btn'
                    : ' bg-pink-500 btn'
                "
              >
                {{ bukuMama.mode === "edit" ? "📝 Edit" : "Simpan" }}
              </button>
              <button
                v-if="bukuMama.mode === 'edit'"
                type="button"
                class="btn bg-gray-600"
                @click="initForm()"
              >
                Batal
              </button>
            </div>
          </Form>
        </div>
      </div>
      <div class="w-full">
        <div class="flex gap-5 mb-4 sticky-lg-top">
          <input
            type="text"
            name="cari"
            id="cari"
            placeholder="Cari..."
            class="form-control"
            v-model="bukuMama.filter.previx"
          />
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="bukuMama.filter.provider"
          >
            <option :value="''">Pilih Provider</option>
            <option value="Telkomsel">Telkomsel</option>
            <option value="IM3">IM3</option>
            <option value="3">3</option>
            <option value="Smartfren">Smartfren</option>
          </select>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="bukuMama.filter.status"
          >
            <option :value="''">Pilih Status</option>
            <option value="PENDING">PENDING</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="CANCELED">CANCELED</option>
          </select>
          <button
            @click="
              bukuMama.filter.previx = '';
              bukuMama.filter.provider = '';
              bukuMama.filter.status = '';
            "
            class="btn bg-gray-800"
            v-if="
              bukuMama.filter.provider ||
              bukuMama.filter.previx ||
              bukuMama.filter.status
            "
          >
            Reset
          </button>
        </div>
        <table class="w-full">
          <thead class="thead-tailwind">
            <tr>
              <th class="th-tailwind">NO.</th>
              <th class="th-tailwind">DATE</th>
              <th class="th-tailwind">PROVIDER</th>
              <th class="th-tailwind">NO. HP</th>
              <th class="th-tailwind">NOMINAL</th>
              <th class="th-tailwind">STATUS</th>
              <th class="th-tailwind">CATATAN</th>
              <th class="th-tailwind">ACTION</th>
            </tr>
          </thead>
          <tbody v-if="filterData.length">
            <tr v-for="(item, index) in filterData" :key="item.id">
              <td class="td-tailwind">{{ index + 1 }}</td>
              <td class="td-tailwind">
                <!-- {{ moment(item.date).format("DD MM YYYY") }} -->
                {{ moment(item.date).format("dddd, DD-MM-YYYY") }}
              </td>
              <td class="td-tailwind">{{ item.provider }}</td>
              <td class="td-tailwind">{{ item.noHp }}</td>
              <td class="td-tailwind">
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(item.nominal)
                }}
              </td>
              <td class="td-tailwind">
                <span
                  :class="
                    useStatus(item.status) +
                    ' py-1 px-2 text-[12px] rounded-xl font-semibold'
                  "
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="td-tailwind">{{ item.catatan }}</td>
              <td class="td-tailwind">
                <div class="flex gap-2">
                  <PencilSquareIcon
                    @click="
                      bukuMama.mode = 'edit';
                      bukuMama.selected = item;
                      bukuMama.form = { ...item };
                    "
                    class="w-5 h-5 text-blue-500 cursor-pointer hover:opacity-80"
                  />
                  <TrashIcon
                    @click="deleteData(item.id)"
                    class="w-5 h-5 text-red-500 cursor-pointer hover:opacity-80"
                  />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td class="td-tailwind" colspan="8">
                <div class="flex justify-center items-center h-full">
                  <span class="text-gray-500">👯 Data is empty</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-pink {
  color: #ff217f;
}

.required::after {
  content: "*";
  color: red;
  padding-left: 0.5em;
}

table tr td,
th {
  @apply dark:text-white;
}

.is-invalid {
  @apply border-red-500 dark:border-red-500 focus:ring-red-500 !important;
}

.invalid-feedback {
  @apply text-red-500 !important;
}

.thead-tailwind {
  @apply border-b-[1px] border-gray-200 dark:border-gray-700;
}

.th-tailwind {
  @apply py-5 px-3 font-semibold text-sm tracking-wide text-left;
}

.td-tailwind {
  @apply py-5 px-3 text-sm;
}

.form-label {
  @apply text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3;
}

.form-select,
.form-control {
  @apply border-2 border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 dark:text-white focus:ring-2  focus:border-transparent;
}

.btn {
  @apply text-white font-semibold rounded-lg px-4 py-2 hover:opacity-75 transition duration-300;
}
</style>
