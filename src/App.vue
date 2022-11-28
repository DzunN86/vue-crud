<script setup>
import { computed, reactive, watchEffect } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/solid";
import { Form, Field, ErrorMessage } from "vee-validate";
import { schema } from "./utils/schemaValidation";
import BgGradient from "./components/BgGradient.vue";
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
    previx: null,
    provider: "",
    status: "",
  },
});

const mutateBukuMama = (values, { resetForm }) => {
  console.log(values);
  if (bukuMama.mode === "Add") {
    bukuMama.data.unshift({
      id: Math.random(),
      provider: values.provider,
      noHp: values.noHp,
      nominal: values.nominal,
      date: new Date().toISOString(),
      status: "PENDING",
      catatan: values.catatan || "-",
    });
    alert(
      `Berhasil ${bukuMama.mode} data dengan provider ${values.provider} dan nomor ${values.noHp}`
    );
    // Reset
    resetForm();
    // initForm();
  } else {
    const index = bukuMama.data.findIndex(
      (item) => item.id === bukuMama.selected.id
    );
    bukuMama.data[index] = {
      // untuk memasukkan data yang sudah ada (id, date)
      ...bukuMama.selected,
      provider: bukuMama.form.provider,
      noHp: bukuMama.form.noHp,
      nominal: bukuMama.form.nominal,
      catatan: bukuMama.form.catatan || "-",
      status: bukuMama.form.status,
    };
    // Reset
    resetForm();
    initForm();
  }
};

// Kebutuhan untuk Darkmode
const isDark = useDark();
const toggleDark = useToggle(isDark);

const customStatus = (status) => {
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
    noHp: null,
    nominal: null,
    catatan: "",
    status: "",
  };
  bukuMama.mode = "Add";
  bukuMama.selected = {};
};

// sodiEffect

// Filter Data
const filterData = computed(() => {
  return bukuMama.data.filter((item) => {
    // Filter Provider
    // Cek apakah form filter provider tidak kosong
    if (bukuMama.filter.provider) {
      // Jika tidak kosong, maka cek apakah provider item tidak sama dengan provider filter
      if (item.provider !== bukuMama.filter.provider) {
        // Jika tidak sama, maka return false (data tidak akan ditampilkan)
        return false;
      }
    }
    // Filter Status
    // Cek apakah form filter status tidak kosong
    if (bukuMama.filter.status) {
      // Jika tidak kosong, maka cek apakah status item tidak sama dengan status filter
      if (item.status !== bukuMama.filter.status) {
        // Jika tidak sama, maka return false (data tidak akan ditampilkan)
        return false;
      }
    }
    // Filter No HP
    // Cek apakah form filter no hp tidak kosong
    if (bukuMama.filter.previx) {
      // Jika tidak kosong, maka cek apakah no hp item tidak sama dengan no hp filter
      if (!item.noHp.startsWith(bukuMama.filter.previx)) {
        // Jika tidak sama, maka return false (data tidak akan ditampilkan)
        return false;
      }
    }
    // Jika semua kondisi diatas tidak terpenuhi, maka return true (data akan ditampilkan semua)
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
</script>

<template>
  <div class="mx-auto w-full px-4 py-[50px] lg:max-w-[1440px]">
    <BgGradient />
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
                name="provider"
                :class="{ 'is-invalid': errors.provider }"
                class="form-select"
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
              <ErrorMessage name="provider" class="invalid-feedback" />
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
              <Field
                as="textarea"
                class="form-control"
                v-model="bukuMama.form.catatan"
                name="catatan"
                rows="3"
                placeholder="Masukkan catatan..."
              />
            </div>
            <div class="flex flex-col" v-if="bukuMama.mode === 'edit'">
              <label for="status" class="form-label">Status</label>
              <div class="flex gap-6">
                <div
                  class="flex gap-2 items-center font-medium dark:text-white"
                >
                  <label for="PENDING">Pending</label>
                  <input
                    type="radio"
                    name="PENDING"
                    value="PENDING"
                    v-model="bukuMama.form.status"
                  />
                </div>
                <div
                  class="flex gap-2 items-center font-medium dark:text-white"
                >
                  <label for="SUCCESS">Selesai</label>
                  <input
                    type="radio"
                    name="SUCCESS"
                    value="SUCCESS"
                    v-model="bukuMama.form.status"
                  />
                </div>
                <div
                  class="flex gap-2 items-center font-medium dark:text-white"
                >
                  <label for="CANCELED">Batalkan</label>
                  <input
                    type="radio"
                    name="CANCELED"
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
      {{}}
      <div class="w-full overflow-x-auto">
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
          <!-- Jika filterData ada -->
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
                    customStatus(item.status) +
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
                      // Sprate Operator or Disctructuring
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
          <!-- Kalau Kosong -->
          <tbody v-else>
            <tr>
              <td class="td-tailwind" colspan="8">
                <div class="flex justify-center items-center h-full">
                  <span class="text-gray-400 text-lg">👯 Data is empty</span>
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
