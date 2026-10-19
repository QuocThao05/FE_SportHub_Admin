import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import shopService from "../../services/shopService";
import addressService from "../../services/addressService";
import { addressUpdateSchema } from "../../util/validators";
import "../../styles/pages/home/ShopManagement.scss";
import { Edit2 } from "lucide-react";

export default function ShopManagement() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [editingShop, setEditingShop] = useState(null);
  const suppressAddressReset = useRef(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await shopService.getAllShops();
      setShops(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load shops", e);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const sortedShops = useMemo(() => {
    let list = [...shops];
    if (sortConfig.key) {
      const key = sortConfig.key;
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      list.sort((a, b) => {
        const aVal = key === "address" ? (a.addressEntity?.street || "") : (a[key] ?? "");
        const bVal = key === "address" ? (b.addressEntity?.street || "") : (b[key] ?? "");
        return String(aVal).localeCompare(String(bVal)) * dir;
      });
    }
    return list;
  }, [shops, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleEdit = (shop) => {
    setEditingShop(shop);
  };

  const closeModal = () => {
    setEditingShop(null);
    reset();
  };

  // react-hook-form for modal with yup validation
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: yupResolver(addressUpdateSchema),
    defaultValues: {
      shopId: "",
      street: "",
      provinceId: null,
      districtId: null,
      wardCode: null,
      country: "Vietnam",
    },
  });

  // Helper to find option by value (loose string compare)
  const findOption = (options = [], val) => {
    if (val === null || val === undefined) return null;
    return options.find((o) => String(o.value) === String(val) || String(o.label) === String(val)) || null;
  };

  const loadProvinces = async () => {
    setLoadingAddress(true);
    try {
      const data = await addressService.getProvinces();
      const mapped = Array.isArray(data)
        ? data.map((p) => ({
            value: String(
              p.id ?? p.provinceId ?? p.ProvinceID ?? p.code ?? p._id
            ),
            label: p.name ?? p.province_name ?? p.ProvinceName ?? p.province ?? p.Province ?? "",
          }))
        : [];
      console.debug("loadProvinces -> fetched", data?.length ?? 0, "mapped", mapped?.length ?? 0, mapped[0]);
      setProvinces(mapped);
    } catch (err) {
      console.error("Load provinces failed", err);
      setProvinces([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  const loadDistricts = async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }
    setLoadingAddress(true);
    try {
      const data = await addressService.getDistricts(provinceId);
      const mapped = Array.isArray(data)
        ? data.map((d) => ({
            value: String(d.id ?? d.districtId ?? d.DistrictID ?? d.code ?? d._id),
            label: d.name ?? d.district_name ?? d.DistrictName ?? d.district ?? d.District ?? "",
          }))
        : [];
      console.debug("loadDistricts -> fetched", data?.length ?? 0, "mapped", mapped?.length ?? 0, mapped[0]);
      setDistricts(mapped);
    } catch (err) {
      console.error("Load districts failed", err);
      setDistricts([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  const loadWards = async (districtId) => {
    if (!districtId) {
      setWards([]);
      return;
    }
    setLoadingAddress(true);
    try {
      const data = await addressService.getWards(districtId);
      const mapped = Array.isArray(data)
        ? data.map((w) => ({
            value: String(w.id ?? w.wardCode ?? w.WardCode ?? w.code ?? w._id),
            label: w.name ?? w.ward_name ?? w.WardName ?? w.ward ?? w.Ward ?? "",
          }))
        : [];
      console.debug("loadWards -> fetched", data?.length ?? 0, "mapped", mapped?.length ?? 0, mapped[0]);
      setWards(mapped);
    } catch (err) {
      console.error("Load wards failed", err);
      setWards([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    loadProvinces();
  }, []);

  // initialize form when editingShop changes
  useEffect(() => {
    if (!editingShop) return;
    (async () => {
      suppressAddressReset.current = true;
      const addr = editingShop.addressEntity || editingShop.address || {};
      // set base values
      reset({
        shopId: editingShop.id ?? editingShop._id ?? "",
        street: addr.street ?? "",
        provinceId: addr.provinceId ? String(addr.provinceId) : (addr.provinceId ?? null),
        districtId: addr.districtId ? String(addr.districtId) : (addr.districtId ?? null),
        wardCode: addr.wardCode ? String(addr.wardCode) : (addr.wardCode ?? null),
        country: addr.country ?? "Vietnam",
      });

      const validId = (v) => v !== undefined && v !== null && v !== "" && String(v) !== "undefined";
      if (validId(addr.provinceId)) {
        await loadDistricts(addr.provinceId);
      }
      if (validId(addr.districtId)) {
        await loadWards(addr.districtId);
      }

      // handle case backend only returned ward name (not code)
      if ((!addr.wardCode || addr.wardCode === null) && addr.ward && wards.length > 0) {
        const m = wards.find((w) => String(w.label) === String(addr.ward));
        if (m) setValue("wardCode", m.value);
      }

      suppressAddressReset.current = false;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingShop]);

  // watch province/district changes to load children
  const watchProvinceId = watch("provinceId");
  const watchDistrictId = watch("districtId");

  useEffect(() => {
    if (suppressAddressReset.current) return;
    const valid = watchProvinceId !== undefined && watchProvinceId !== null && watchProvinceId !== "" && String(watchProvinceId) !== "undefined";
    if (valid) {
      loadDistricts(watchProvinceId);
    } else {
      setDistricts([]);
    }
    // clear dependent fields
    setValue("districtId", null);
    setValue("wardCode", null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchProvinceId]);

  useEffect(() => {
    if (suppressAddressReset.current) return;
    const valid = watchDistrictId !== undefined && watchDistrictId !== null && watchDistrictId !== "" && String(watchDistrictId) !== "undefined";
    if (valid) {
      loadWards(watchDistrictId);
    } else {
      setWards([]);
    }
    setValue("wardCode", null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchDistrictId]);

  const onSubmit = async (formData) => {
    if (!editingShop) return;
    const payload = { shopId: formData.shopId ?? editingShop.id ?? editingShop._id };
    const addr = {};
    if (formData.street?.trim()) addr.street = formData.street.trim();
    if (formData.country?.trim()) addr.country = formData.country.trim();

    if (formData.provinceId) {
      addr.provinceId = Number(formData.provinceId);
      addr.province = findOption(provinces, formData.provinceId)?.label || null;
    }
    if (formData.districtId) {
      addr.districtId = Number(formData.districtId);
      addr.district = findOption(districts, formData.districtId)?.label || null;
    }
    if (formData.wardCode) {
      addr.wardCode = Number(formData.wardCode);
      addr.ward = findOption(wards, formData.wardCode)?.label || null;
    }

    // Validation of required fields is handled by Yup resolver; proceed to submit

    Object.assign(payload, addr);

    setSaving(true);
    try {
      const updated = await shopService.updateAddress(payload);
      const updatedShop = updated ?? null;
      if (updatedShop) {
        setShops((prev) =>
          prev.map((s) => (String(s.id ?? s._id) === String(updatedShop.id ?? updatedShop._id) ? updatedShop : s))
        );
      } else {
        await fetchShops();
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const renderAddressCell = (shop) => {
    const a = shop.addressEntity || shop.address || {};
    return [a.street, a.ward, a.district, a.province, a.country].filter(Boolean).join(", ") || "—";
  };

  return (
    <div className="shop-management page-container">
      <h2>Shop Management</h2>

    
      {loading ? (
        <div>Loading shops...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedShops.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 12 }}>
                    No shops found.
                  </td>
                </tr>
              ) : (
                sortedShops.map((shop) => (
                  <tr key={shop.id ?? shop._id ?? shop.name}>
                    <td>{shop.name}</td>
                    <td>{renderAddressCell(shop)}</td>
                    <td className="actions">
                      <button onClick={() => handleEdit(shop)}>
                        <Edit2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingShop && (
        <div className="edit-address-modal">
          <div className="modal-content">
            <h3>Edit Address — {editingShop.name}</h3>
            <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
              <label>
                Street
                <Controller
                  name="street"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <input {...field} />
                      {fieldState.error?.message && <div className="field-error">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </label>

              <label>
                Province
                <Controller
                  name="provinceId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        classNamePrefix="react-select"
                        options={provinces}
                        placeholder="Chọn tỉnh/thành"
                        value={findOption(provinces, field.value)}
                        onChange={(opt) => field.onChange(opt?.value ?? null)}
                        isClearable
                        isSearchable={false}
                        isLoading={loadingAddress}
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                          menu: (base) => ({ ...base, zIndex: 99999 }),
                        }}
                      />
                      {fieldState.error?.message && <div className="field-error">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </label>

              <label>
                District
                <Controller
                  name="districtId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        classNamePrefix="react-select"
                        options={districts}
                        placeholder="Chọn quận/huyện"
                        value={findOption(districts, field.value)}
                        onChange={(opt) => field.onChange(opt?.value ?? null)}
                        isClearable
                        isSearchable={false}
                        isLoading={loadingAddress}
                        isDisabled={!watchProvinceId}
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                          menu: (base) => ({ ...base, zIndex: 99999 }),
                        }}
                      />
                      {fieldState.error?.message && <div className="field-error">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </label>

              <label>
                Ward
                <Controller
                  name="wardCode"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        classNamePrefix="react-select"
                        options={wards}
                        placeholder="Chọn phường/xã"
                        value={findOption(wards, field.value)}
                        onChange={(opt) => field.onChange(opt?.value ?? null)}
                        isClearable
                        isSearchable={false}
                        isLoading={loadingAddress}
                        isDisabled={!watchDistrictId}
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                          menu: (base) => ({ ...base, zIndex: 99999 }),
                        }}
                      />
                      {fieldState.error?.message && <div className="field-error">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </label>

              <label>
                Country
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input {...field} disabled title="Country cannot be changed" />
                     
                    </>
                  )}
                />
              </label>

              <div className="modal-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
