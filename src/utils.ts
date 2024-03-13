export function useStorageVersioning(lastUpdated: string) {
	if (localStorage.getItem('use-storage-version') !== lastUpdated) {
		localStorage.clear();
		localStorage.setItem('use-storage-version', lastUpdated);
	}
}
