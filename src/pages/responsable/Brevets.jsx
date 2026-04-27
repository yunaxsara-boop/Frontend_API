import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Datatable";
import { useRespBrevets } from "./RespBrevetsContext";

export default function RespBrevets() {
  const navigate = useNavigate();
  const { brevets, deleteBrevet } = useRespBrevets();

  return (
    <DataTable
      title="Gestion des brevets"
      
      data={brevets}
      columns={[
        { key: "num_brevet",    label: "N° Brevet" },
        { key: "titre",         label: "Titre" },
        { key: "num_depo",      label: "N° Dépôt" },
        { key: "date_depo",     label: "Date dépôt" },
        { key: "date_sortie",   label: "Date sortie" },
        { key: "titulaire",     label: "Titulaire" },
        { key: "nom_inventeur", label: "Inventeur" },
        { key: "nom_deposant",  label: "Déposant" },
        { key: "status",        label: "Statut" },
        {
          key: "documents", label: "Documents",
          render: (v) => v?.length > 0 ? v.join(", ") : "Aucun",
        },
      ]}
      onAdd={()     => navigate("/responsable/brevets/add")}
      onEdit={(row) => navigate(`/responsable/brevets/edit/${row.id}`)}
      onView={(row) => navigate(`/responsable/brevets/view/${row.id}`)}
      onDelete={(row) => deleteBrevet(row.id)}
    />
  );
}