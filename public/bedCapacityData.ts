// public/bedCapacityData.ts
export const bedCapacityData = [
    {
      department: "Emergency",
      beds: [
        { type: "General Emergency", total: 30, occupied: 25, reserved: 3 },
        { type: "Trauma", total: 15, occupied: 12, reserved: 2 },
        { type: "Pediatric Emergency", total: 10, occupied: 8, reserved: 1 },
        { type: "Isolation", total: 8, occupied: 3, reserved: 0 },
        { type: "Resuscitation", total: 5, occupied: 2, reserved: 1 }
      ]
    },
    {
      department: "ICU",
      beds: [
        { type: "Medical ICU", total: 20, occupied: 18, reserved: 2 },
        { type: "Surgical ICU", total: 15, occupied: 14, reserved: 1 },
        { type: "Cardiac ICU", total: 10, occupied: 9, reserved: 0 },
        { type: "Neurological ICU", total: 8, occupied: 6, reserved: 1 },
        { type: "Pediatric ICU", total: 6, occupied: 5, reserved: 1 }
      ]
    },
    {
      department: "General Ward",
      beds: [
        { type: "Medical", total: 50, occupied: 42, reserved: 5 },
        { type: "Surgical", total: 40, occupied: 35, reserved: 3 },
        { type: "Pediatric", total: 30, occupied: 25, reserved: 2 },
        { type: "Maternity", total: 25, occupied: 18, reserved: 4 },
        { type: "Geriatric", total: 20, occupied: 15, reserved: 2 }
      ]
    },
    {
      department: "Specialty Units",
      beds: [
        { type: "Oncology", total: 15, occupied: 12, reserved: 2 },
        { type: "Cardiology", total: 12, occupied: 10, reserved: 1 },
        { type: "Neurology", total: 10, occupied: 8, reserved: 1 },
        { type: "Orthopedics", total: 20, occupied: 16, reserved: 2 },
        { type: "Psychiatric", total: 18, occupied: 12, reserved: 3 }
      ]
    },
    {
      department: "Post-Operative",
      beds: [
        { type: "Recovery Room", total: 10, occupied: 8, reserved: 1 },
        { type: "Post-Surgical", total: 25, occupied: 20, reserved: 3 },
        { type: "Day Surgery", total: 15, occupied: 10, reserved: 2 },
        { type: "Step-Down", total: 12, occupied: 9, reserved: 1 },
        { type: "High Dependency", total: 8, occupied: 6, reserved: 1 }
      ]
    },
    {
      department: "Long-Term Care",
      beds: [
        { type: "Rehabilitation", total: 30, occupied: 25, reserved: 3 },
        { type: "Palliative Care", total: 15, occupied: 12, reserved: 2 },
        { type: "Chronic Disease", total: 20, occupied: 16, reserved: 2 },
        { type: "Ventilator", total: 10, occupied: 8, reserved: 1 },
        { type: "Transitional Care", total: 12, occupied: 9, reserved: 1 }
      ]
    }
  ];