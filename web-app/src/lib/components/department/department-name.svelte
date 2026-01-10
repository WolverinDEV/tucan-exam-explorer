<script lang="ts">
	import { kInstituteMapping } from './metadata';

	const { departmentId }: { departmentId: string } = $props();
	const department = $derived(kInstituteMapping[departmentId] ?? kInstituteMapping['']!);
</script>

{department.name}
