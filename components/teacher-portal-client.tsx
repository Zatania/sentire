import { useRouter } from 'next/navigation';

// Other imports...

const TeacherPortalClient = () => {
    const router = useRouter();

    // Other component logic...

    const handleRowClick = (id) => {
        router.push(`/dashboard/students/${id}`);
    };

    return (
        <table>
            <tbody>
                {students.map((student) => (
                    <tr key={student.id} onClick={() => handleRowClick(student.id)} className="cursor-pointer hover:bg-gray-200">
                        <td>{student.name}</td>
                        {/* Additional table data... */}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TeacherPortalClient;