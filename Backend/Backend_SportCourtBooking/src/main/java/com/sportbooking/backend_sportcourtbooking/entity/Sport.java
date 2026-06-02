package com.sportbooking.backend_sportcourtbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "sports")
@Data @NoArgsConstructor @AllArgsConstructor
public class Sport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String iconUrl;

    @JsonIgnore
    @OneToMany(mappedBy = "sport")
    private List<Court> courts;
}
