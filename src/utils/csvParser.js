import Papa from 'papaparse';

export function parseFinanceCSV(file, onComplete, onError) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: (results) => {
      const data = results.data;
      if (data.length === 0) {
        if (onError) onError(new Error("CSV file is empty."));
        return;
      }

      // Detect Date Column key (usually 'Date' or 'time')
      const keys = Object.keys(data[0] || {});
      const dateKey = keys.find(k => k.toLowerCase() === 'date' || k.toLowerCase() === 'time');
      
      // Detect Price Column key (usually 'Close', 'Adj Close', 'price', 'value')
      const priceKey = keys.find(k => 
        k.toLowerCase() === 'adj close' || 
        k.toLowerCase() === 'close' || 
        k.toLowerCase() === 'price' || 
        k.toLowerCase() === 'value'
      );

      if (!dateKey || !priceKey) {
        if (onError) onError(new Error(`Could not autodetect basic columns. Found columns: ${keys.join(', ')}. Need a date and a price column.`));
        return;
      }

      // Transform into Lightweight Charts format
      const formattedData = [];
      for (const row of data) {
        const rawDate = row[dateKey];
        let price = row[priceKey];
        
        if (!rawDate || price == null) continue;

        // Try to format date strictly to YYYY-MM-DD
        let normalizedDate;
        try {
          const d = new Date(rawDate);
          if (isNaN(d.getTime())) continue; // Skip invalid dates
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          normalizedDate = `${yyyy}-${mm}-${dd}`;
        } catch (e) {
          continue;
        }

        // Lightweight Charts needs data nicely sorted chronological, so we will sort it afterwards
        formattedData.push({
          time: normalizedDate,
          value: Number(price)
        });
      }

      // Sort by time just in case the CSV was backwards 
      // (Yahoo CSVs are generally chronological, but some source them descending)
      formattedData.sort((a, b) => new Date(a.time) - new Date(b.time));

      // Remove overlapping duplicate dates if any (might happen due to timezone stripping above)
      const uniqueData = [];
      let lastDate = "";
      for (const item of formattedData) {
        if (item.time !== lastDate) {
          uniqueData.push(item);
          lastDate = item.time;
        }
      }

      onComplete(uniqueData, file.name);
    },
    error: (err) => {
      if (onError) onError(err);
    }
  });
}
