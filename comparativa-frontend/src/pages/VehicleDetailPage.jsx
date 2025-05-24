{Object.entries(vehicle.detalle).map(([key, value], index) => (
  <li key={`detail-${key}-${index}`}><strong>{key}:</strong> {String(value)}</li>
))} 